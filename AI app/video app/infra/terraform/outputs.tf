output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.this.domain_name
  description = "Domain name of the CloudFront distribution"
}

output "origin_bucket_name" {
  value       = module.origin_bucket.s3_bucket_id
  description = "S3 bucket storing video assets"
}
