locals {
  stack_name             = "${var.name_prefix}-${var.environment}"
  ansible_inventory_path = "${path.module}/../../ansible/inventory.aws.ini"
  az                     = coalesce(var.availability_zone, data.aws_availability_zones.available.names[0])
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.name_prefix
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_vpc" "dentlux" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${local.stack_name}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.dentlux.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = local.az
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.stack_name}-public-subnet"
  }
}

resource "aws_internet_gateway" "dentlux" {
  vpc_id = aws_vpc.dentlux.id

  tags = {
    Name = "${local.stack_name}-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.dentlux.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.dentlux.id
  }

  tags = {
    Name = "${local.stack_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "dentlux" {
  name_prefix = "${local.stack_name}-"
  description = "DentLux SSH and application ports"
  vpc_id      = aws_vpc.dentlux.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  dynamic "ingress" {
    for_each = [80, 443, 4000, 8080, 8090]
    content {
      description = "app-${ingress.value}"
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${local.stack_name}-sg"
  }
}

resource "aws_key_pair" "dentlux" {
  key_name_prefix = "${local.stack_name}-"
  public_key      = var.ssh_public_key

  tags = {
    Name = "${local.stack_name}-key"
  }
}

resource "aws_eip" "dentlux" {
  domain = "vpc"

  tags = {
    Name = "${local.stack_name}-eip"
  }

  depends_on = [aws_internet_gateway.dentlux]
}

resource "aws_instance" "dentlux" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.dentlux.id]
  key_name               = aws_key_pair.dentlux.key_name

  root_block_device {
    volume_size = var.disk_size_gb
    volume_type = "gp3"
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh.tpl", {
    ssh_user = var.ssh_user
  }))

  tags = {
    Name = "${local.stack_name}-vm"
  }

  depends_on = [aws_internet_gateway.dentlux]
}

resource "aws_eip_association" "dentlux" {
  instance_id   = aws_instance.dentlux.id
  allocation_id = aws_eip.dentlux.id
}

resource "local_file" "ansible_inventory" {
  filename = local.ansible_inventory_path
  content  = <<-EOF
    [dentlux:vars]
    app_owner=${var.ssh_user}

    [dentlux]
    ${aws_eip.dentlux.public_ip} ansible_user=${var.ssh_user} ansible_port=22
  EOF

  depends_on = [aws_eip_association.dentlux]
}
