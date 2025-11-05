/**
 * 导入器模块
 * 负责处理文件导入和浏览器历史/书签导入功能
 * 提供与Electron对话框交互和IPC通信的功能
 */
import { dialog } from 'electron'

import { BrowserType } from '@deta/types'

import { ipcSenders } from './ipcHandlers'
import { useLogScope } from '@deta/utils'

/** 导入器日志实例 */
const log = useLogScope('Importer')

/**
 * 导入文件
 * 打开文件选择对话框，允许用户选择多个文件进行导入
 */
export const importFiles = async () => {
  try {
    const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    log.debug('Import files:', result)
    if (result.canceled) return

    ipcSenders.importedFiles(result.filePaths)
  } catch (error) {
    log.error('Error importing files:', error)
  }
}

/**
 * 导入浏览器历史记录
 * @param type 浏览器类型
 */
export const importBrowserHistory = async (type: BrowserType) => {
  try {
    ipcSenders.importBrowserHistory(type)
  } catch (error) {
    log.error('Error importing browser history:', error)
  }
}

/**
 * 导入浏览器书签
 * @param type 浏览器类型
 */
export const importBrowserBookmarks = async (type: BrowserType) => {
  try {
    ipcSenders.importBrowserBookmarks(type)
  } catch (error) {
    log.error('Error importing browser bookmarks:', error)
  }
}
