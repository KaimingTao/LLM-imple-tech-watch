variable "primary_region" {
  type        = string
  description = "Primary AWS region for uploads"
  default     = "us-east-1"
}

variable "replica_regions" {
  type        = list(string)
  description = "Regions to replicate objects to for low-latency ingress"
  default     = ["eu-central-1", "ap-southeast-1"]
}

variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket to host transcoded video output"
}

variable "custom_domains" {
  type        = list(string)
  description = "Domain aliases for the CloudFront distribution"
  default     = []
}

variable "allowed_cors_origins" {
  type        = list(string)
  description = "Allowed CORS origins for playback"
  default     = ["https://streamforge.example.com"]
}

variable "acm_certificate_arn" {
  type        = string
  description = "ARN of the ACM certificate in us-east-1"
}

variable "waf_acl_arn" {
  type        = string
  description = "Optional AWS WAF ACL ARN to attach to the distribution"
  default     = null
}
