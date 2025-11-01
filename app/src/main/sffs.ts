/**
 * SFFS (Structured File and Folder System) 主模块
 * 该模块负责管理应用程序的资源存储和检索功能
 * 提供资源的读取、更新和转换等核心功能
 */
import { app } from 'electron'
import { initBackend } from '../preload/helpers/backend'
import { isDev } from '@deta/utils/system'
import type {
  SFFSRawCompositeResource,
  SFFSRawResource,
  SFFSRawResourceTag,
  SFFSResource,
  SFFSResourceTag
} from '@deta/types'
import { optimisticParseJSON } from '@deta/utils'

/**
 * SFFS主类，提供资源管理的核心功能
 */
export class SFFSMain {
  /** SFFS底层接口实例 */
  sffs: any
  /** 资源管理接口实例 */
  resources: any

  /**
   * 构造函数
   * @param sffs SFFS底层接口实例
   * @param resources 资源管理接口实例
   */
  constructor(sffs: any, resources: any) {
    this.sffs = sffs
    this.resources = resources
  }

  /**
   * 将原始复合资源转换为标准资源格式
   * @param composite 原始复合资源对象
   * @returns 转换后的标准资源对象
   */
  static convertCompositeResourceToResource(composite: SFFSRawCompositeResource): SFFSResource {
    return {
      id: composite.resource.id,
      type: composite.resource.resource_type,
      path: composite.resource.resource_path,
      createdAt: composite.resource.created_at,
      updatedAt: composite.resource.updated_at,
      deleted: composite.resource.deleted === 1,
      metadata: {
        name: composite.metadata?.name ?? '',
        sourceURI: composite.metadata?.source_uri ?? '',
        alt: composite.metadata?.alt ?? '',
        userContext: composite.metadata?.user_context ?? ''
      },
      tags: (composite.resource_tags || []).map((tag) =>
        SFFSMain.convertRawResourceTagToResourceTag(tag)
      ),
      annotations: (composite.resource_annotations || []).map((annotation) => {
        return {
          id: annotation.id,
          type: annotation.resource_type,
          path: annotation.resource_path,
          // tags are missing as we are not getting back a composite resource for annotations
          createdAt: annotation.created_at,
          updatedAt: annotation.updated_at,
          deleted: annotation.deleted === 1
        }
      }),
      postProcessingState: composite.post_processing_job?.state,
      spaceIds: composite.space_ids ?? []
    }
  }

  /**
   * 将标准资源转换为原始复合资源格式
   * @param resource 标准资源对象
   * @returns 转换后的原始复合资源对象
   */
  static convertResourceToCompositeResource(resource: SFFSResource): SFFSRawCompositeResource {
    return {
      resource: {
        id: resource.id,
        resource_path: resource.path,
        resource_type: resource.type,
        created_at: resource.createdAt,
        updated_at: resource.updatedAt,
        deleted: resource.deleted ? 1 : 0
      },
      metadata: {
        id: '', // TODO: what about metadata id? do we need to keep it around?
        resource_id: resource.id,
        name: resource.metadata?.name ?? '',
        source_uri: resource.metadata?.sourceURI ?? '',
        alt: resource.metadata?.alt ?? '',
        user_context: resource.metadata?.userContext ?? ''
      },
      resource_tags: (resource.tags || []).map((tag) => ({
        id: tag.id ?? '',
        resource_id: resource.id,
        tag_name: tag.name,
        tag_value: tag.value
      }))
    }
  }

  /**
   * 将原始资源标签转换为标准资源标签格式
   * @param raw 原始资源标签
   * @returns 转换后的标准资源标签
   */
  static convertRawResourceTagToResourceTag(raw: SFFSRawResourceTag): SFFSResourceTag {
    return {
      id: raw.id,
      name: raw.tag_name,
      value: raw.tag_value
    }
  }

  /**
   * 读取指定ID的资源
   * @param id 资源ID
   * @param opts 选项，包括是否包含注释
   * @returns 返回资源对象，如果不存在则返回null
   */
  async readResource(
    id: string,
    opts?: { includeAnnotations?: boolean }
  ): Promise<SFFSResource | null> {
    console.log('reading resource with id', id)
    const dataString = await this.sffs.js__store_get_resource(id, opts?.includeAnnotations ?? false)

    const composite = optimisticParseJSON<SFFSRawCompositeResource>(dataString)
    if (!composite) {
      return null
    }

    return SFFSMain.convertCompositeResourceToResource(composite)
  }

  /**
   * 更新资源信息
   * @param resource 要更新的资源对象
   * @returns 更新操作的结果
   */
  async updateResource(resource: SFFSRawResource) {
    console.debug('updating resource with id', resource.id, 'data:', resource)

    const stringified = JSON.stringify(resource)

    const result = this.sffs.js__store_update_resource(stringified)
    return result
  }
}

/** 全局SFFS主实例 */
let sffsMain: SFFSMain | null = null

/**
 * 获取SFFS主实例的钩子函数
 * @returns SFFS主实例，如果未初始化则返回undefined
 */
export const useSFFSMain = () => {
  if (!sffsMain) {
    console.error('SFFSMain not initialized')
    return undefined
  }

  return sffsMain
}

/**
 * 初始化SFFS主实例
 * @returns 初始化后的SFFS主实例
 */
export const initializeSFFSMain = () => {
  console.log('Initializing SFFSMain...')
  const result = initBackend({
    num_worker_threads: 2,
    num_processor_threads: 1,
    userDataPath: app.getPath('userData'),
    appPath: `${app.getAppPath()}${isDev ? '' : '.unpacked'}`
  })

  ;(result.sffs as any).js__backend_set_surf_backend_health(true)

  sffsMain = new SFFSMain(result.sffs, result.resources)
  return sffsMain
}
