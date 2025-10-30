import { app, nativeImage } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { useLogScope } from '@deta/utils'

// 创建拖拽相关日志记录器
const log = useLogScope('drag')

/**
 * 获取文件拖拽预览图片
 * @param filePath 文件路径
 * @param fileType 文件类型（MIME类型）
 * @returns Electron nativeImage 对象，用于拖拽时显示的预览图标
 */
const getPreviewImage = (filePath: string, fileType: string) => {
  // 对于图片类型的文件，创建预览图并调整尺寸
  if (fileType.startsWith('image')) {
    const previewImage = nativeImage.createFromPath(filePath)
    if (!previewImage.isEmpty()) {
      const size = previewImage.getSize()
      // 保持原始宽高比例，将宽度调整为100px
      return previewImage.resize({ width: 100, height: (100 * size.height) / size.width })
    }
  }

  // 对于非图片类型的文件，使用应用图标作为默认预览图
  const iconPath = path.join(app.getAppPath(), 'build/resources/prod/icon.png')
  const image = nativeImage.createFromPath(iconPath)
  return image.resize({ width: 50, height: 50 })
}

/**
 * 处理拖拽开始事件
 * @param webContents Electron的WebContents实例，用于操作网页内容
 * @param resourceId 资源唯一标识符
 * @param filePath 文件系统中的文件路径
 * @param fileType 文件的MIME类型
 */
export const handleDragStart = async (
  webContents: Electron.WebContents,
  resourceId: string,
  filePath: string,
  fileType: string
) => {
  try {
    log.log('Start drag', filePath)

    // 获取拖拽预览图片
    const previewImage = getPreviewImage(filePath, fileType)

    // 特殊处理图片类型文件
    if (fileType.startsWith('image')) {
      const imageType = fileType.split('/')[1]

      // 创建一个临时文件副本，添加文件类型后缀以确保目标应用能识别，同时添加前缀以便内部识别
      const tempFilePath = path.join(
        app.getPath('temp'),
        `space_resource_${resourceId}.${imageType}`
      )

      log.log('Temp file path', tempFilePath)

      // 复制原始文件到临时路径
      await fs.copyFile(filePath, tempFilePath)

      // 开始拖拽操作，使用临时文件和预览图片
      webContents.startDrag({
        file: tempFilePath,
        icon: previewImage
      })

      // TODO: 找到更好的方式在拖拽完成后清理临时文件
      // setTimeout(() => {
      //     fs.unlinkSync(tempFilePath)
      // }, 1000)
    } else {
      // 对于非图片文件，直接使用原始文件路径进行拖拽
      webContents.startDrag({
        file: filePath,
        icon: previewImage
      })
    }
  } catch (error) {
    // 记录拖拽过程中的错误
    log.error('Error starting drag', error)
  }
}
