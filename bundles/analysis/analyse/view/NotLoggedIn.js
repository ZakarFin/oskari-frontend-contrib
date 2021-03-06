/**
 * @class Oskari.analysis.bundle.analyse.view.NotLoggedIn
 * Analyse view for users that haven't logged in. Analyse can only be used
 * when logged in because maps are linked to a user. Asks the user to log in
 * and offers links to login/register.
 */
Oskari.clazz.define('Oskari.analysis.bundle.analyse.view.NotLoggedIn',

    /**
     * @method create called automatically on construction
     * @static
     * @param {Oskari.analysis.bundle.analyse.AnalyseBundleInstance} instance
     *     reference to component that created this view
     * @param {Object} localization
     *     localization data in JSON format
     */
    function (instance, localization) {
        this.instance = instance;
        this.template = jQuery('<div class="notLoggedIn"></div>');
        this.loginTemplate = jQuery('<div class="notLoggedIn"><a></a></div>');
        this.registerTemplate = jQuery('<div class="notLoggedIn"><a></a></div>');
        this.loc = localization;
    }, {
        /**
         * @method render
         * Renders the view to given DOM element
         * @param {jQuery} container reference to DOM element this component will be rendered to
         */
        render: function (container) {
            var conf = this.instance.conf || {};
            var content = this.template.clone();
            var login = this.loginTemplate.clone();
            var register = this.registerTemplate.clone();
            const discounted = this.template.clone();

            discounted.append(this.loc.discountedNotice);
            container.prepend(discounted);

            content.append(this.loc.text);
            container.append(content);

            var loginUrl = Oskari.getLocalized(conf.loginUrl) || Oskari.urls.getLocation('login');
            if (loginUrl) {
                var loginLink = login.find('a');
                loginLink.attr('href', loginUrl);
                loginLink.append(this.loc.signup);
                container.append(login);
            }

            var registerUrl = Oskari.getLocalized(conf.registerUrl) || Oskari.urls.getLocation('register');
            if (registerUrl) {
                var registerLink = register.find('a');
                registerLink.attr('href', registerUrl);
                registerLink.append(this.loc.register);
                container.append(register);
            }
        }
    });
