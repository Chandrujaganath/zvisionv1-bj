export interface StreamInfo {
  stream_url: string
  status: string
  resolution?: string
  format?: string
  fps?: number
  [key: string]: any // For any additional properties
}

export interface StreamResponse {
  success: boolean
  data: StreamInfo
}

export interface DetectionStatus {
  status: "running" | "stopped" | "error"
  last_updated?: string
  [key: string]: any
}

export interface DetectionResponse {
  success: boolean
  data: DetectionStatus
}
