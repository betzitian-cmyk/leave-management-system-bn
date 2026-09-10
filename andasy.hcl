# andasy.hcl app configuration file generated for hr-employees-management-bn on Monday, 16-Mar-26 15:01:04 SAST
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "hr-employees-management-bn"

app {

  env = {
    HOST = "::"
  }

  port = 4000

  primary_region = "fsn"

  compute {
    cpu      = 1
    memory   = 512
    cpu_kind = "shared"
  }

  process {
    name = "hr-employees-management-bn"
  }

}
