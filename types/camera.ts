export interface Camera {
  id: string
  location?: string
  roi?: string
  stream_url?: string
  status?: string
  last_seen?: string
  [key: string]: any // For any additional properties
}

export interface CameraResponse {
  success: boolean
  data: {
    [key: string]: Omit<Camera, "id">
  }
}

export interface CameraDetailResponse {
  success: boolean
  data: Omit<Camera, "id">
}

export interface RegisterCameraPayload {
  camera_id: string
  camera_config: {
    location?: string
    roi?: string
    stream_url?: string
    [key: string]: any
  }
}
