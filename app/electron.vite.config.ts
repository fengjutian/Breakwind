// Electron Vite 配置文件 - 用于配置Electron应用的构建过程

// 导入Electron Vite核心功能
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
// 导入Svelte Vite插件
import { svelte } from '@sveltejs/vite-plugin-svelte'
// 导入Node.js路径处理模块
import { resolve } from 'path'
// 导入Markdown处理插件
import { plugin as Markdown, Mode } from 'vite-plugin-markdown'
// 导入Rollup替换插件
import replace from '@rollup/plugin-replace'
// 导入CSS注入插件
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
// 导入自定义插件 - 合并预加载脚本
import { esbuildConsolidatePreloads } from './plugins/merge-chunks'
// 导入Node.js polyfills插件
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// 导入许可证相关插件
import { createConcatLicensesPlugin, createLicensePlugin } from './plugins/license'
import { createRustLicensePlugin } from './plugins/rust-license'

// 判断是否为开发环境
const IS_DEV = process.env.NODE_ENV === 'development'

// 控制是否静默警告（开发环境或显式设置静默警告时为true）
// TODO: 实际上修复代码中的警告
const silenceWarnings = IS_DEV || process.env.SILENCE_WARNINGS === 'true'

// Svelte配置选项
const svelteOptions = silenceWarnings
  ? {
      // 警告处理器配置，忽略可访问性警告
      onwarn: (warning, handler) => {
        if (warning.code.toLowerCase().includes('a11y')) return
        handler(warning)
      }
    }
  : {}

// CSS预处理配置
const cssConfig = silenceWarnings
  ? {
      preprocessorOptions: {
        scss: {
          // 静默SCSS相关的废弃API警告
          silenceDeprecations: ['legacy-js-api', 'mixed-decls']
        }
      }
    }
  : {
      preprocessorOptions: {
        scss: {}
      }
    }

// 导出Electron Vite配置
export default defineConfig({
  // Main进程配置（主进程是Electron的核心进程）
  main: {
    // 环境变量前缀
    envPrefix: 'M_VITE_',
    // 插件配置
    plugins: [
      // 将依赖项外部化，避免打包到输出文件中
      externalizeDepsPlugin(),
      // 为main进程生成许可证文件
      createLicensePlugin('main')
    ],
    // 构建配置
    build: {
      rollupOptions: {
        // 入口文件配置
        input: {
          // 主进程入口
          index: resolve(__dirname, 'src/main/index.ts'),
          // 图像处理工作进程入口
          imageProcessor: resolve(__dirname, 'src/main/workers/imageProcessor.ts')
        }
      }
    },
    // 全局常量定义
    define: {
      'import.meta.env.PLATFORM': JSON.stringify(process.platform),
      'process.platform': JSON.stringify(process.platform)
    },
    // CSS配置
    css: cssConfig
  },
  
  // Preload进程配置（预加载脚本）
  preload: {
    // 环境变量前缀
    envPrefix: 'P_VITE_',
    // 插件配置
    plugins: [
      // Svelte插件
      svelte(svelteOptions),
      // 外部化依赖项，排除特定模块
      externalizeDepsPlugin({ exclude: ['@deta/backend'] }),
      // 合并预加载脚本
      esbuildConsolidatePreloads('out/preload'),
      // CSS注入插件配置
      cssInjectedByJsPlugin({
        // 仅处理特定文件名的JS资源
        jsAssetsFilterFunction: (asset) => asset.fileName.endsWith('webcontents.js'),
        // 自定义CSS注入代码
        injectCode: (cssCode, _options) => {
          return `window.addEventListener('DOMContentLoaded', () => { try{if(typeof document != 'undefined'){var elementStyle = document.createElement('style');elementStyle.id="webview-styles";elementStyle.appendChild(document.createTextNode(${cssCode}));document.head.appendChild(elementStyle);}}catch(e){console.error('vite-plugin-css-injected-by-js', e);} })`
        }
      }),
      // 替换代码中的特定模式
      replace({
        'doc.documentElement.style': '{}'
      }),
      // 为preload进程生成许可证文件
      createLicensePlugin('preload')
    ],
    // 构建配置
    build: {
      rollupOptions: {
        // 入口文件配置
        input: {
          // 核心预加载脚本
          core: resolve(__dirname, 'src/preload/core.ts'),
          // WebContents预加载脚本
          webcontents: resolve(__dirname, 'src/preload/webcontents.ts'),
          // 覆盖层预加载脚本
          overlay: resolve(__dirname, 'src/preload/overlay.ts'),
          // 资源预加载脚本
          resource: resolve(__dirname, 'src/preload/resource.ts')
        }
      },
      // 禁用源码映射
      sourcemap: false,
      // 启用代码压缩
      minify: true
    },
    // 全局常量定义
    define: {
      'import.meta.env.PLATFORM': JSON.stringify(process.platform),
      'process.platform': JSON.stringify(process.platform)
    },
    // CSS配置
    css: cssConfig
  },
  
  // Renderer进程配置（渲染进程，负责UI渲染）
  renderer: {
    // 环境变量前缀
    envPrefix: 'R_VITE_',
    // 插件配置
    plugins: [
      // Markdown处理插件，支持Markdown和HTML模式
      Markdown({ mode: [Mode.MARKDOWN, Mode.HTML] }),
      // Svelte插件
      svelte(svelteOptions),
      // 为renderer进程生成许可证文件
      createLicensePlugin('renderer'),
      // Node.js polyfills，用于支持某些依赖
      nodePolyfills({
        globals: {
          Buffer: true
        }
      }),
      // 为后端Rust依赖生成许可证文件
      createRustLicensePlugin('packages/backend', 'dependencies-backend.txt'),
      createRustLicensePlugin('packages/backend-server', 'dependencies-backend-server.txt'),
      // 合并许可证文件
      createConcatLicensesPlugin()
    ],
    // 构建配置
    build: {
      // 禁用源码映射
      sourcemap: false,
      // Rollup配置
      rollupOptions: {
        // 入口文件配置
        input: {
          // 主界面
          main: resolve(__dirname, 'src/renderer/Core/core.html'),
          // 设置界面
          settings: resolve(__dirname, 'src/renderer/Settings/settings.html'),
          // PDF查看器
          pdf: resolve(__dirname, 'src/renderer/PDF/pdf.html'),
          // 覆盖层界面
          overlay: resolve(__dirname, 'src/renderer/Overlay/overlay.html'),
          // 资源管理界面
          resource: resolve(__dirname, 'src/renderer/Resource/resource.html')
        },
        // 外部依赖（不打包到输出文件中）
        external: [
          'html-minifier-terser/dist/htmlminifier.esm.bundle.js',
          '@internationalized/date'
        ],
        // 输出配置
        output: {
          // 输出格式为ES模块
          format: 'es',
          // 代码块文件名格式
          chunkFileNames: 'assets/[name]-[hash].js',
          // 入口文件命名格式
          entryFileNames: 'assets/[name]-[hash].js',
          // 资源文件命名格式
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      // 启用代码压缩
      minify: true
    },
    // 全局常量定义
    define: {
      'import.meta.env.PLATFORM': JSON.stringify(process.platform),
      'process.platform': JSON.stringify(process.platform)
    },
    // CSS配置
    css: cssConfig
  }
})
