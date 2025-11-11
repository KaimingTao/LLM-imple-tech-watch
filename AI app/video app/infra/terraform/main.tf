terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.primary_region
}

module "origin_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = var.bucket_name

  versioning = {
    enabled = true
  }

  cors_rule = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "HEAD"]
      allowed_origins = var.allowed_cors_origins
      max_age_seconds = 3000
    }
  ]

  lifecycle_rule = [
    {
      id      = "transcode-cache"
      enabled = true
      expiration = {
        days = 365
      }
    }
  ]
}

resource "aws_cloudfront_origin_access_identity" "this" {
  comment = "StreamForge video distribution"
}

resource "aws_cloudfront_distribution" "this" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "StreamForge CDN"

  aliases = var.custom_domains

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "video-origin"

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 30
    max_ttl     = 31536000
  }

  origin {
    domain_name = module.origin_bucket.s3_bucket_bucket_regional_domain_name
    origin_id   = "video-origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.this.cloudfront_access_identity_path
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = var.acm_certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }

  web_acl_id = var.waf_acl_arn
}

module "media_store" {
  source  = "terraform-aws-modules/media-store/aws"
  version = ">= 1.0.0"

  name   = "streamforge-cdn"
  region = var.primary_region
}
