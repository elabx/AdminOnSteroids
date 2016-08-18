$(document).ready(function () {

    var AOSsettings = AOSsettings || JSON.parse(ProcessWire.config.AdminOnSteroids),
        HotkeysSettings = AOSsettings.Hotkeys,
        BreadcrumbsSettings = ProcessWire.config.AOS_breadcrumbs;


    if (HotkeysSettings.indexOf('breadcrumbTweaks') && BreadcrumbsSettings) {

        // add "data-*" markups
        // skip first item in Default admin theme (.pw-panel)
        $('#breadcrumbs a:not(.pw-panel)').each(function (i) {

            // Default admin theme has an extra element in the beginning of the breadcrumb
            if (!BreadcrumbsSettings[i]) {
                return true;    // = continue
            }

            if (BreadcrumbsSettings[i]['url']) {
                $(this).attr('data-url', BreadcrumbsSettings[i]['url']);
            }
            if (BreadcrumbsSettings[i]['editUrl']) {
                $(this).attr('data-editurl', BreadcrumbsSettings[i]['editUrl']);
            }
        });

        $('#breadcrumbs').on('longclick', 'a', function (e) {
            if ($(this).attr('data-url')) {
                e.preventDefault();
                var url = $(this).attr('data-url');
                window.open(url);
            }
        });

        $('#breadcrumbs').on('click', 'a', function (e) {
            if (e.ctrlKey && $(this).attr('data-editurl')) {
                e.preventDefault();
                var url = $(this).attr('data-editurl');
                window.location = url;
            }
        });
    }


    function getSaveButton() {

        var aos_saveButton = false;

        if (window.frameElement) {

            // in iframe
            aos_saveButton = $('.ui-dialog-buttonset button[role="button"]', window.parent.document).eq(0);

        } else {

            aos_saveButton = $('form.InputfieldForm').find('button[type="submit"]')
                .filter('.aos_hotkeySave, form#ProcessTemplateAdd #Inputfield_submit, #submit_publish, #Inputfield_submit_save, #submit_save, #ProcessTemplateEdit #Inputfield_submit, #Inputfield_submit_save_field, #Inputfield_submit_save_module, #submit_save_profile, #save_translations')
                .eq(0);

            // modal opened, but controls have focus (outside the iframe)
            if(aos_saveButton.length == 0) {
                aos_saveButton = $('.ui-dialog-buttonset button[role="button"]').eq(0);
            }
        }

        return aos_saveButton;
    }


    function aos_triggerSave() {

        var aos_saveButton = getSaveButton();

        if (aos_saveButton.length) {

            $('body').addClass('aos_saving');
            $('#wrap, body.AdminThemeDefault #content').addClass('ui-state-disabled');

            aos_saveButton.addClass('ui-state-disabled').focus();

            // IE fix
            setTimeout(function() {
                aos_saveButton.click();
            }, 100);
        }
    }

    function setupCKESave() {
        if (window.CKEDITOR) {
            CKEDITOR.on('instanceReady', function (evt) {
                evt.editor.document.on('keydown', function (e) {
                    // ctrl+s
                    if (e.data.getKeystroke() == CKEDITOR.CTRL + 83) {
                        e.data.$.preventDefault();
                        aos_triggerSave();
                    }
                });
            });
        }
    }

    if (HotkeysSettings.indexOf('save') !== -1) {

        $(document).on('keydown', function (e) {


            if (e.ctrlKey && e.keyCode == 83) {

                aos_triggerSave();

                // intentionally disable browser Save as dialog globally
                // only inside this function to avoid keydown hijack
                e.preventDefault();

            }
        });

        // ctrl+s in CKEditor
        setupCKESave();

        // ctrl+s in CKEditor (repeaters)
        // $(document).on('reloaded', '.Inputfield', function () {
        $(document).on('reloaded', '.InputfiesldRepeaterItem', function () {
            setupCKESave();
        });
    }
});
