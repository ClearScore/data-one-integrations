module.exports = {
    extends: ['@commitlint/config-conventional'],
    parserPreset: {
        parserOpts: {
            // List of possible Jira ticket prefixes + github issue prefix
            issuePrefixes: ['DATA1'],
        },
    },
    rules: {
        'references-empty': [2, 'never'],
        'header-max-length': [0, 'never', 200],
    },
};
