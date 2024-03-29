# frozen_string_literal: true
gem 'blacklight', '~> 7.24'
#gem 'geoblacklight', '~> 4.0.0.pre.rc1'
gem 'geoblacklight', '~> 4.1.0'
gem 'webpacker'

# Hack for https://github.com/rails/rails/issues/35153
# Adapted from https://github.com/projectblacklight/blacklight/pull/2065
gemfile = File.expand_path('Gemfile')
IO.write(gemfile, File.open(gemfile) do |f|
  text = f.read
  text.gsub(/^gem 'sqlite3'$/, 'gem "sqlite3", "~> 1.3.6"')
end)

run 'bundle install'

generate 'blacklight:install', '--devise'
generate 'geoblacklight:install', '-f'
generate 'geoblacklight:webpacker', '-f'

rake 'db:migrate'
