terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

# Set the variable value in *.tfvars file
# or using -var="do_token=..." CLI option
variable "do_token" {}

variable "region" {
  default = "nyc2"
}

variable "droplet_count" {
  type = number
  default = 1
}

variable "droplet_size" {
  type = string
  default = "s-1vcpu-1gb"
}

# Configure the DigitalOcean Provider
provider "digitalocean" {
  token = var.do_token
}

# data "digitalocean_account" "account_info" {
# }

# output "droplet_limit" {
#   value = data.digitalocean_account.account_info.droplet_limit
# }

data "digitalocean_ssh_key" "mykey" {
  name = "temchurras"
}

resource "digitalocean_droplet" "web" {
  count = var.droplet_count
  image = "ubuntu-20-04-x64"
  name = "web-${var.region}-${count.index}"
  region = var.region
  size = var.droplet_size
  ssh_keys = [data.digitalocean_ssh_key.mykey.id]

  lifecycle {
    create_before_destroy = true
  }
}

output "server_ip" {
  value = digitalocean_droplet.web.*.ipv4_address
}