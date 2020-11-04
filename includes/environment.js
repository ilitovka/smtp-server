/**
 * @author Vladyslav Litovka vlitovka@corevalue.net
 * This helper will take care about merging environment variables into config file based on mapping specified in config file
 * config.env rules might be applied only on tree of objects, so only string, int or bool properties might be specified as a result.
 */
/**
 * Function which checking if there is rules specified in 'env' section of config and if such environment variables was
 * set and passed as argument to this method.
 *
 * @param object env - reference to process.env
 * @param object config - configuration object
 */
module.exports = function merge(env, config) {
    if (env !== undefined && config !== undefined && config.env !== undefined) {
        Object.keys(config.env).forEach((variable) => {
            let rec = (treeNode, nextItems) => {
                if (nextItems.length > 1 && treeNode[nextItems[0]] !== undefined) {
                    rec(treeNode[nextItems[0]], nextItems.slice(1));
                } else if (nextItems.length === 1) {
                    treeNode[nextItems[0]] = env[variable];
                }
            };

            if (env[variable] !== undefined && config.env[variable].length && config[config.env[variable][0]] !== undefined) {
                rec(config, config.env[variable]);
            }
        });
    }
};
