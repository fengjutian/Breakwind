/**
 * 后端原生模块构建脚本
 * 通过 `cargo-cp-artifact` 调用 `cargo build` 并将编译产物复制为 `index.node`。
 * 支持通过在命令后追加 `--` 来向 Cargo 传递附加参数（例如 `--release`）。
 */
const { spawn } = require('child_process')

// 解析命令行中的附加参数（在 `--` 之后的内容），并原样传递给 Cargo
const extraArgsIndex = process.argv.indexOf('--')
const extraArgs = extraArgsIndex !== -1 ? process.argv.slice(extraArgsIndex + 1) : []

// 使用 cargo-cp-artifact 将 Cargo 构建产物复制到目标文件
const command = 'cargo-cp-artifact'
const args = [
  '-nc',
  // 输出的 Node 原生扩展文件名
  'index.node',
  '--',
  'cargo',
  // 构建后端的 Rust 代码
  'build',
  // 使诊断信息以 JSON 渲染的形式输出，便于工具链解析
  '--message-format=json-render-diagnostics',
  ...extraArgs
]

// 这里可以设置额外的环境变量（例如启用 Rust 日志）
const env = {
  // RUST_LOG: 'info'
}

// 启动子进程执行构建命令
// - stdio: 'inherit' 继承当前终端的输入输出，便于直接查看日志
// - shell: true 在 Windows/Powershell 环境下以 shell 运行，兼容命令解析
// - env: 混合当前进程的环境变量与自定义变量
const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ...env }
})

// 子进程级错误（如命令不可用、权限问题）
child.on('error', (error) => {
  console.error(`error: ${error.message}`)
  process.exit(1)
})

// 构建流程结束时的退出码回传
child.on('close', (code) => {
  console.log(`process exited with code ${code}`)
  process.exit(code)
})
