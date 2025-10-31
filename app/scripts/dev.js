// 开发环境启动脚本 - 用于启动Electron应用的开发服务器

// 导入Node.js子进程模块，用于执行外部命令
const { spawn } = require('child_process')
// 导入文件系统模块，用于文件操作
const fs = require('fs')
// 导入路径模块，用于处理文件路径
const path = require('path')

// 检查macOS平台特定配置
if (process.platform === 'darwin') {
  // 解析Electron框架路径
  const frameworksPath = path.resolve(
    __dirname,
    '..',
    '..',
    'node_modules',
    'electron',
    'dist',
    'Electron.app',
    'Contents',
    'Frameworks'
  )

  // 验证框架目录是否存在，不存在则报错退出
  if (!fs.existsSync(frameworksPath)) {
    console.error('`Frameworks` directory not found:', frameworksPath)
    process.exit(1)
  }
}

// Linux平台特定环境变量配置
if (process.platform === 'linux') {
  // 设置Electron Ozone平台提示，用于自动适配Linux显示服务器
  process.env.ELECTRON_OZONE_PLATFORM_HINT = 'auto'
}

// 设置Tesseract OCR引擎的数据文件路径
process.env.TESSDATA_PREFIX = path.resolve(__dirname, '..', 'resources', 'tessdata')

// 设置开发环境产品名称
process.env.M_VITE_PRODUCT_NAME = 'Breakwind-dev'

// 设置Rust日志级别，默认为静默，仅显示后端服务器信息和后端调试信息
process.env.RUST_LOG = process.env.RUST_LOG || 'none,backend_server=INFO,backend=DEBUG'

// 处理命令行参数中的额外参数（以--分隔）
const extraArgsIndex = process.argv.indexOf('--')
const extraArgs = extraArgsIndex !== -1 ? process.argv.slice(extraArgsIndex + 1) : []

// 定义要执行的命令和参数
const command = 'electron-vite' // Electron Vite构建工具
const args = ['dev', '-w', ...extraArgs] // 开发模式、监视文件变化、添加额外参数

// 启动electron-vite开发服务器
const child = spawn(command, args, {
  stdio: 'inherit', // 继承父进程的标准输入输出
  shell: true,      // 使用shell执行命令
  env: process.env  // 传递环境变量
})

// 处理子进程错误事件
child.on('error', (error) => {
  console.error(`error: ${error.message}`)
})

// 处理子进程结束事件
child.on('close', (code) => {
  console.log(`process exited with code ${code}`)
})
