terraform {
  required_providers {
    proxmox = {
      source  = "Telmate/proxmox"
      version = "~> 2.9.11"  # Or latest stable
    }
  }
}

variable "pm_api_url" {
  description = "Proxmox API URL"
  type        = string
}

variable "pm_user" {
  description = "Proxmox API user"
  type        = string  
}

variable "pm_password" {
  description = "Proxmox API password"
  type        = string
  sensitive   = true  
}

provider "proxmox" {
  pm_api_url      = var.pm_api_url
  pm_user         = var.pm_user
  pm_password     = var.pm_password
  pm_tls_insecure = true
}

resource "proxmox_vm_qemu" "k8s-worker" {
  name   = "k8s-worker"
  vmid   = 106
  target_node = "pve"

  clone = "nixostemp"

  cores  = 1
  memory = 2048
  sockets = 1

  disk {
    size    = "5G"
    type    = "scsi"
    storage = "local-lvm"
  }

  network {
    model  = "virtio"
    bridge = "vmbr0"
  }
}
