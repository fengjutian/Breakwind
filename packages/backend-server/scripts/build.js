/*
 * 后端服务构建脚本（backend-server）
 *
 * 作用：
 * - 使用 `cargo-cp-artifact` 包装 `cargo build`，解析 JSON 元数据并复制编译产物。
 * - 根据是否包含 `--dev`，生成目标二进制名：`surf-backend[-dev][.exe]`。
 * - 支持在 `--` 之后透传额外的 Cargo 构建参数（如 `--release`、`--features`）。
 * - 默认将产物复制到 `app/resources/bin`，可通过环境变量 `RESOURCES_BIN_DIR` 覆盖。
 */
// Node 内置模块
const { spawn } = require('child_process')
const { join } = require('path')
const fs = require('fs')

// 产物输出目录：优先使用环境变量 `RESOURCES_BIN_DIR`，否则落到应用资源目录
const binDir = process.env.RESOURCES_BIN_DIR || join(__dirname, '../../../app/resources/bin')
// `cargo-cp-artifact` 复制出的源二进制文件名（由该工具在当前工作目录下生成）
const sourceBin = 'backend-server'

// 是否为开发构建：命名中追加 `-dev`
const isDev = process.argv.includes('--dev')
// dev: surf-backend-dev, prod: surf-backend
// dev-win: surf-backend-dev.exe, prod-win: surf-backend.exe
// 目标二进制名称：Windows 加 `.exe`，其余平台不加后缀
const targetBin = `surf-backend${isDev ? '-dev' : ''}${process.platform === 'win32' ? '.exe' : ''}`
// 目标二进制完整路径
const targetBinPath = join(binDir, targetBin)
// 解析 `--` 之后的附加参数，原样传入到 `cargo build`
const extraArgsIndex = process.argv.indexOf('--')
const extraArgs = extraArgsIndex !== -1 ? process.argv.slice(extraArgsIndex + 1) : []

// 使用 cargo-cp-artifact 包装构建：
// - `-n`：从环境变量 `npm_package_name` 推导 crate 名（去掉作用域），用于匹配产物。
// - `-b`：产物类型为 `bin`（可选类型还有 `cdylib`、`dylib`）。
// - `sourceBin`：复制时的输出文件名（目标临时文件），稍后再手动重命名/复制到最终位置。
const command = 'cargo-cp-artifact'
const args = [
  '-nb',
  sourceBin,
  '--',
  'cargo',
  'build',
  // 让 Cargo 输出可解析的 JSON 诊断信息，cargo-cp-artifact 通过它定位产物
  '--message-format=json-render-diagnostics',
  ...extraArgs
]

// 启动子进程执行构建：继承父进程的 stdio，启用 shell，并传递当前环境变量
const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: process.env
})

// 子进程启动错误：直接退出并输出错误信息
child.on('error', (error) => {
  console.error(`error: ${error.message}`)
  process.exit(1)
})

// 构建结束：检查退出码，验证源产物是否存在，复制到目标目录
child.on('close', (code) => {
  console.log(`Cargo-cp-artifact process exited with code ${code}`)

  console.log(`Copying binary now, current working directory: ${process.cwd()}`)

  if (code !== 0) {
    // 构建失败：原样返回退出码
    console.log('error: build failed')
    process.exit(code)
  }

  if (!fs.existsSync(sourceBin)) {
    // 未找到由 cargo-cp-artifact 复制出的源二进制文件
    console.error(`Source file does not exist: ${sourceBin}`)
    process.exit(1)
  }

  console.log(`copying binary from ${sourceBin} to ${targetBinPath}`)
  try {
    if (!fs.existsSync(binDir)) {
      // 目标目录不存在则先创建
      fs.mkdirSync(binDir)
    }
    // 将源二进制复制到最终的目标路径（名称包含平台/环境差异）
    fs.copyFileSync(sourceBin, targetBinPath)
  } catch (err) {
    console.error(`error: ${err.message}`)
    process.exit(1)
  }
})
