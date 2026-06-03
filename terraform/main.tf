module "vpc" {
  source = "./modules/vpc"
}

module "security_group" {
  source = "./modules/security-group"
  vpc_id = module.vpc.vpc_id
}

module "networking" {
  source = "./modules/networking"
  vpc_id = module.vpc.vpc_id
}

module "ec2" {
  source            = "./modules/ec2"
  ami_id            = var.ami_id
  security_group_id = module.security_group.sg_id
  subnet_id         = module.networking.public_subnet_id
}