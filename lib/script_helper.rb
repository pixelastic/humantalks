require 'awesome_print'
require 'json'
require 'nokogiri'
require 'open-uri'

# Shared access to common methods
module ScriptHelper
  # Read the API key either from ENV or from a file in the source folder
  def api_key(name)
    env_key = "#{name.upcase}_API_KEY"
    file_key = "_#{name}_api_key"

    # First read in ENV
    return ENV[env_key] if ENV[env_key]

    # Otherwise from file in source directory
    if File.exist?(file_key) && File.size(file_key) > 0
      return File.open(file_key).read.strip
    end
    nil
  end

  # Write a JSON file on disk
  def write_json(basename, content)
    path = File.expand_path("./#{basename}.json")
    content = JSON.pretty_generate(content)
    File.write(path, content)
  end

  def read_json(path)
    JSON.parse(File.open("#{path}.json").read)
  end
end
