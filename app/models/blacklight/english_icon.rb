# frozen_string_literal: true
# YJ created on January 28, 2024 7:32AM for dispalying English translation when mouse over ENG icon.
module Blacklight
  class EnglishIcon
    attr_reader :icon_name, :aria_hidden, :label, :role, :additional_options

    ##
    # @param [String, Symbol] icon_name
    # @param [String] classes additional classes separated by a string
    # @param [Boolean] aria_hidden include aria_hidden attribute
    # @param [Boolean] label include <title> and aria-label as part of svg
    # @param [String] role role attribute to be included in svg
    # @param [Hash] additional_options the way forward instead of named arguments
    def initialize(icon_name, classes: '', aria_hidden: false, label: true, role: 'img', additional_options: {})
      @icon_name = icon_name
      @classes = classes
      @aria_hidden = aria_hidden
      @label = label
      @role = role
      @additional_options = additional_options

      # YJ added on 04/07/2023 6:15 PM to connect to ChatGPT
      #client = OpenAI::Client.new(access_token: 'YOUR_API_KEY')
      # Connect from geoblacklight-app/app/services/chatgpt_service.rb
      @client = ChatgptService.connection
    end

    ##
    # Returns an updated version of the svg source
    # @return [String]
    def svg
      svg = ng_xml.at_xpath('svg')
      #svg['aria-label'] = icon_label if label
      svg['role'] = role
      svg.prepend_child("<title>#{icon_label}</title>") if label
      ng_xml.to_xml
    end

    def icon_label
      #icon_name = "アンカレッヂ--ダッチハーバー"
      #icon_name = "耶鲁大学"
      # YJ added on 04/07/2023 3:53 PM for ChatGPT translate to English title. Display when mouse over icon.
       translate_title = ChatgptService.translate_to_english(@client, icon_name)
       I18n.translate("blacklight.icon.#{icon_name_context}", default: translate_title.to_s.titleize)
    end

    ##
    # @return [Hash]
    def options
      {
        class: classes,
        "aria-hidden": (true if aria_hidden)
      }
    end

    ##
    # @return [String]
    def path
      "blacklight/english.svg"
    end

    ##
    # @return [String]
    def file_source
      raise Blacklight::Exceptions::IconNotFound, "Could not find #{path}" if file.blank?

      # Handle both Sprockets::Asset and Propshaft::Asset
      data = file.respond_to?(:source) ? file.source : file.path.read

      data.force_encoding('UTF-8')
    end

    def ng_xml
      @ng_xml ||= Nokogiri::XML(file_source).remove_namespaces!
    end

    private

    def icon_name_context
      ["english", additional_options[:label_context]].compact.join('_')
    end

    # @return [Sprockets::Asset,Propshaft::Asset]
    def file
      return Rails.application.assets.load_path.find(path) if defined? Propshaft

      # Rails.application.assets is `nil` in production mode (where compile assets is enabled).
      # This workaround is based off of this comment: https://github.com/fphilipe/premailer-rails/issues/145#issuecomment-225992564
      (Rails.application.assets || ::Sprockets::Railtie.build_environment(Rails.application)).find_asset(path)
    end

    def classes
      " blacklight-icons blacklight-icon-#{icon_name} #{@classes} ".strip
    end
  end
end
