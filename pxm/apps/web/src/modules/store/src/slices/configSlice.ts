'use client'
import { createSlice } from '@reduxjs/toolkit'

import {
  Attribute,
  PugTemplate,
  RoleVisibility,
  SubField,
  Tab,
  Visibility,
} from '../types'

import type { PayloadAction } from '@reduxjs/toolkit'

interface ExportField {
  alias: string
  id: string
  is_alias_used: boolean
  is_used: boolean
  label: string
}

interface ImageVariant {
  alias: string
  convert: boolean
  convert_layers: boolean
  extension: string
  include_in_download: boolean
  layers: boolean[]
  quality: string
  size_px: string
  transparent_color: string
}

interface VideoVariant {
  alias: string
  extension: string
  id: string
  quality: string
  size_px: string
  transparent_color: string
}

interface FolderTemplate {
  attribute_groups: string[]
  attributes: string[]
  db_id: string
  id: string
  name: string
}

interface ImportSettings {
  add_non_existing_collection: boolean
  additional_search_tags_action: string
  attributes_only: boolean
  date_format: string
  delimiter: string
  enable_tagging: boolean
  false_display_value: string
  folder_template: FolderTemplate
  ignore_empty_cells: boolean
  multi_select_joiner: string
  parent_category_action: string
  regions_action: string
  roles_action: string
  true_display_value?: string
}

interface AttributSettings {
  filter_file_specifications: boolean
  filter_topic_specifications: boolean
}

interface DefaultSorting {
  documents: string
  images: string
  misc: string
  resources: string
  videos: string
}

interface Features {
  content_brief: boolean
  content_optimization: boolean
  content_optimization1: boolean
  demo_syndication: boolean
  syndication: boolean
  white_glove: boolean
}

interface ExportAttribute {
  alias: string
  collection_count: number
  file_count: number
  group_id: string[]
  id: string
  is_alias_used: boolean
  is_associated: boolean
  is_file_filter: boolean
  is_topic_filter: boolean
  label: string
  maximum: number
  minimum: number
  options: string[]
  region_ids: string[]
  roles: string[]
  show_label: boolean
  value: string
  value_type: string
}

interface ExportPermissions {
  regions: string[]
  roles: Visibility
  special_status: { published: boolean; unpublished: boolean }
}

interface Metadata {
  browser: string
  initiated_by: string
  os: string
  platform: string
  request_id: string
  source: string
  version: string
}

interface ConfigPath {
  assets: string
  iframe: string
  iframe_lightbox: string
  image: string
  misc: string
  pdf: string
  video: string
}

interface LightBoxExportFields {
  export_attributes: ExportAttribute[]
  export_collection_file_filters: {
    permissions: ExportPermissions
  }
  export_core_fields: ExportField[]
  export_files: {
    document: ExportField[]
    image: ExportField[]
    misc: ExportField[]
    video: ExportField[]
  }
  id: string
  is_individual_media_allowed: boolean
  is_stack_multiple_media: boolean
  name: string
  regions: string[]
  visibility: Visibility
}

interface ChannelsSettings {
  syndication_check: {
    compliance: {
      disabled: boolean
      display_name: string
      status: boolean
    }
    field: {
      disabled: true
      display_name: string
      status: true
    }
    schema: {
      disabled: true
      display_name: string
      status: true
    }
  }
}

interface ConversionSettings {
  constraint_variant: string
  image: {
    variant: {
      large: ImageVariant[]
      medium: ImageVariant[]
      small: ImageVariant[]
      thumb: ImageVariant[]
    }
  }
  video: {
    constraint_variant: string
    variant: {
      preview: VideoVariant[]
      thumb: VideoVariant[]
    }
  }
}

interface DisplaySettings {
  file_sort: string
  file_view: string
  folder_sort: string
  folder_view: string
  transparency: number
}

interface ModuleSettings {
  add_non_existing_collection: boolean
  additional_search_tags_action: string
  attributes_only: boolean
  batch_action_max_size: number
  batch_action_part_size: number
  batch_action_threshold: number
  date_format: string
  delimiter: string
  enable_import: boolean
  enable_tagging: boolean
  false_display_value: string
  file_sort: string
  file_view: string
  folder_sort: string
  folder_template: FolderTemplate
  folder_view: string
  google_vision: boolean
  ignore_empty_cells: boolean
  locales: { id: string; label: string }[]
  parent_category_action: string
  permission_inheritance: boolean
  regions_action: string
  roles_action: string
}

interface ProfileSettings {
  admin_email: string
  browser_tab_title: string
  default_system_timezone: string
  default_topic_timeout: number
  domain: string
  email_template_title: string
  ga_id: string
  hero_tags: string[]
  noreply_email: string
  share_link_timeout: number
  site_url: string
  support_email: string
}

interface SearchSettings {
  default_search_results_view: string
}

interface ThemesSettings {
  colors: {
    primary: string
    search_box_text: string
    secondary: string
    share_download_font: string
  }
  default_background: string
  email_header: string
  image_watermark: string
  logo: string
  logo_big: string
  share_download_background: string
  transparency: number
  use_default_background_image: boolean
}

interface UISetupSettings {
  customizable_terms: {
    category: string
    category_plural: string
    lightbox: string
    main_menu_folder: string
    region: string
    search_result_tab_name: string
    topic: string
    topic_plural: string
  }
  sort_layout: {
    default_search_results_view: string
    file_sort: string
    file_view: string
    folder_sort: string
    folder_view: string
  }
}

interface UploaderSettings {
  enable_tagging: boolean
  published: boolean
  published_end_date: string | null
  published_start_date: string | null
  region_ids: string[]
  roles: string[]
}

interface ConfigSettings {
  channels: ChannelsSettings
  conversion: ConversionSettings
  display: DisplaySettings
  global_import_settings: ImportSettings
  import: ImportSettings
  module: ModuleSettings
  profile: ProfileSettings
  search: SearchSettings
  themes: ThemesSettings
  ui_setup: UISetupSettings
  uploader: UploaderSettings
}

interface SystemText {
  category: string
  category_plural: string
  lightbox: string
  main_menu_folder: string
  region: string
  search_result_tab_name: string
  topic: string
  topic_plural: string
}

interface SimpleItem {
  id: string
  name: string
}
export interface IConfigState {
  attribute_settings: AttributSettings
  auth0_enabled: boolean
  auth0_org_id: string
  default_sorting: DefaultSorting
  features: Features
  global_settings: boolean
  hero_attribute: Attribute
  hero_preview_attribute: string
  host: string
  hostname: string
  id: string
  import_visibility: string[]
  light_box_export_fields: LightBoxExportFields
  line_list: string
  metadata: Metadata
  multiple_line_list: PugTemplate
  name: string
  node: string
  path: ConfigPath
  pug_templates: PugTemplate
  role_visibility: RoleVisibility
  roles: SimpleItem[]
  regions: SimpleItem[]
  search_filters: SubField[]
  settings: ConfigSettings
  system_text: SystemText
  tabs: Tab[]
  topic_icon: string
  updated_date: string
}

const initialState: IConfigState = {
  attribute_settings: {
    filter_file_specifications: false,
    filter_topic_specifications: false,
  },
  auth0_enabled: false,
  auth0_org_id: '',
  default_sorting: {
    documents: '',
    images: '',
    misc: '',
    resources: '',
    videos: '',
  },
  features: {
    content_brief: false,
    content_optimization: false,
    content_optimization1: false,
    demo_syndication: false,
    syndication: false,
    white_glove: false,
  },
  global_settings: false,
  hero_attribute: {
    collection_count: 0,
    file_count: 0,
    group_id: [],
    label: '',
    id: '',
    is_associated: false,
    language_code: '',
    maximum: 0,
    minimum: 0,
    options: [],
    region_ids: [],
    roles: [],
    value: '',
    value_type: 'Text',
  },
  hero_preview_attribute: '',
  host: '',
  hostname: '',
  id: '',
  import_visibility: [],
  light_box_export_fields: {
    export_attributes: [],
    export_collection_file_filters: {
      permissions: {
        regions: [],
        roles: {
          admin: false,
          anonymous: false,
          contributor: false,
          gpuser: false,
          guser: false,
          superadmin: false,
        },
        special_status: { published: false, unpublished: false },
      },
    },
    export_core_fields: [],
    export_files: {
      document: [],
      image: [],
      misc: [],
      video: [],
    },
    id: '',
    is_individual_media_allowed: false,
    is_stack_multiple_media: false,
    name: '',
    regions: [],
    visibility: {
      admin: false,
      anonymous: false,
      contributor: false,
      gpuser: false,
      guser: false,
      superadmin: false,
    },
  },
  line_list: '',
  metadata: {
    browser: '',
    initiated_by: '',
    os: '',
    platform: '',
    request_id: '',
    source: '',
    version: '',
  },
  multiple_line_list: {
    fields: [
      {
        background: '',
        description_fields_length: 0,
        fields: [],
        id: '',
        main_fields_length: 0,
        name: '',
        regions: [],
        visibility: {
          admin: false,
          anonymous: false,
          contributor: false,
          gpuser: false,
          guser: false,
          superadmin: false,
        },
      },
    ],
    pdfsheet: false,
    pdfsheet_visibility_control: {
      admin: false,
      anonymous: false,
      contributor: false,
      gpuser: false,
      guser: false,
      superadmin: false,
    },
  },
  name: '',
  node: '',
  path: {
    assets: '',
    iframe: '',
    iframe_lightbox: '',
    image: '',
    misc: '',
    pdf: '',
    video: '',
  },
  pug_templates: {
    fields: [
      {
        background: '',
        description_fields_length: 0,
        fields: [],
        id: '',
        image_stack_group_id: '',
        main_fields_length: 0,
        name: '',
        regions: [],
        split_label: false,
        visibility: {
          admin: false,
          anonymous: false,
          contributor: false,
          gpuser: false,
          guser: false,
          superadmin: false,
        },
      },
    ],
    ids: [],
    pdfsheet: false,
    pdfsheet_visibility_control: {
      admin: false,
      anonymous: false,
      contributor: false,
      gpuser: false,
      guser: false,
      superadmin: false,
    },
  },
  role_visibility: {
    allow_asset_download: [],
    empty_category: [],
    empty_category_hierarchy: [],
    empty_category_result: [],
    empty_tabs: [],
    empty_topic: [],
  },
  roles: [],
  regions: [],
  search_filters: [],
  settings: {
    channels: {
      syndication_check: {
        compliance: {
          disabled: false,
          display_name: '',
          status: false,
        },
        field: {
          disabled: true,
          display_name: '',
          status: true,
        },
        schema: {
          disabled: true,
          display_name: '',
          status: true,
        },
      },
    },
    conversion: {
      constraint_variant: '',
      image: {
        variant: {
          large: [],
          medium: [],
          small: [],
          thumb: [],
        },
      },
      video: {
        constraint_variant: '',
        variant: {
          preview: [],
          thumb: [],
        },
      },
    },
    display: {
      file_sort: '',
      file_view: '',
      folder_sort: '',
      folder_view: '',
      transparency: 0,
    },
    global_import_settings: {
      add_non_existing_collection: false,
      additional_search_tags_action: '',
      attributes_only: false,
      date_format: '',
      delimiter: '',
      enable_tagging: false,
      false_display_value: '',
      folder_template: {
        attribute_groups: [],
        attributes: [],
        db_id: '',
        id: '',
        name: '',
      },
      ignore_empty_cells: false,
      multi_select_joiner: '',
      parent_category_action: '',
      regions_action: '',
      roles_action: '',
      true_display_value: '',
    },
    import: {
      add_non_existing_collection: false,
      additional_search_tags_action: '',
      attributes_only: false,
      date_format: '',
      delimiter: '',
      enable_tagging: false,
      false_display_value: '',
      folder_template: {
        attribute_groups: [],
        attributes: [],
        db_id: '',
        id: '',
        name: '',
      },
      ignore_empty_cells: false,
      multi_select_joiner: '',
      parent_category_action: '',
      regions_action: '',
      roles_action: '',
    },
    module: {
      add_non_existing_collection: false,
      additional_search_tags_action: '',
      attributes_only: false,
      batch_action_max_size: 0,
      batch_action_part_size: 0,
      batch_action_threshold: 0,
      date_format: '',
      delimiter: '',
      enable_import: false,
      enable_tagging: false,
      false_display_value: '',
      file_sort: '',
      file_view: '',
      folder_sort: '',
      folder_view: '',
      google_vision: false,
      ignore_empty_cells: false,
      locales: [],
      parent_category_action: '',
      permission_inheritance: false,
      regions_action: '',
      roles_action: '',
      folder_template: {
        attribute_groups: [],
        attributes: [],
        db_id: '',
        id: '',
        name: '',
      },
    },
    profile: {
      admin_email: '',
      browser_tab_title: '',
      default_system_timezone: '',
      default_topic_timeout: 0,
      domain: '',
      email_template_title: '',
      ga_id: '',
      hero_tags: [],
      noreply_email: '',
      share_link_timeout: 0,
      site_url: '',
      support_email: '',
    },
    search: {
      default_search_results_view: '',
    },
    themes: {
      colors: {
        primary: '',
        search_box_text: '',
        secondary: '',
        share_download_font: '',
      },
      default_background: '',
      email_header: '',
      image_watermark: '',
      logo: '',
      logo_big: '',
      share_download_background: '',
      transparency: 0,
      use_default_background_image: false,
    },
    ui_setup: {
      customizable_terms: {
        category: '',
        category_plural: '',
        lightbox: '',
        main_menu_folder: '',
        region: '',
        search_result_tab_name: '',
        topic: '',
        topic_plural: '',
      },
      sort_layout: {
        default_search_results_view: '',
        file_sort: '',
        file_view: '',
        folder_sort: '',
        folder_view: '',
      },
    },
    uploader: {
      enable_tagging: false,
      published: false,
      published_end_date: null,
      published_start_date: null,
      region_ids: [],
      roles: [],
    },
  },
  system_text: {
    category: '',
    category_plural: '',
    lightbox: '',
    main_menu_folder: '',
    region: '',
    search_result_tab_name: '',
    topic: '',
    topic_plural: '',
  },
  tabs: [],
  topic_icon: '',
  updated_date: '',
}

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<IConfigState>) => action.payload,
  },
})

export const { setConfig } = configSlice.actions
export const configReducer = configSlice.reducer
