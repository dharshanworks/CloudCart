terraform {
  backend "s3" {
    bucket         = "cloudcart-terraform-state-774923"
    key            = "cloudcart/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "cloudcart-terraform-lock"
    encrypt        = true
  }
}