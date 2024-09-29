const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
    const defaultConfig = await getDefaultConfig(__dirname);

    // Override transformer to use 'react-native-svg-transformer'
    defaultConfig.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

    // Filter out 'svg' from assetExts and add 'svg' to sourceExts
    defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
        (ext) => ext !== 'svg'
    );
    defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'svg', 'cjs'];

    // Add support for Hermes
    defaultConfig.resolver.sourceExts.push('hbc');
    defaultConfig.transformer.getTransformOptions = async () => ({
        transform: {
            experimentalImportSupport: false,
            inlineRequires: true,
        },
    });

    return defaultConfig;
})();