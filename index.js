var azure = require('azure');
var cliArgs = require("command-line-args");
var cli = cliArgs([{
  name: "help",
  type: Boolean,
  alias: "h",
  description: "Print usage instructions"
}, {
  name: "topic",
  type: String,
  alias: "t",
  description: "ServiceBus topic name"
}, {
  name: "subscription",
  type: String,
  alias: "s",
  description: "Subscription name"
}, {
  name: "filter",
  type: String,
  alias: "f",
  description: "Optional topic filter",
}, {
  name: "connectionString",
  type: String,
  alias: "c",
  description: "Connection String for the service bus"
}]);

// Hack to shift the args when used with jx compile
if (process.IsEmbedded) process.argv.unshift(process.argv[0]);
var options = cli.parse();


if (options.help) {
  /* generate a usage guide */
  var usage = cli.getUsage({
    header: "A tool to create Azure ServiceBus Topic Subscriptoins.",
    footer: "For more information, please visit https://github.com/IntertechInc/serviceBusSubscription-cli."
  });

  console.log(options.help ? usage : options);
} else {
  var topicName = options.topic;
  var subscriptionName = options.subscription;
  var filterName = options.filter;
  var serviceBusService = azure.createServiceBusService(options.connectionString);

  var rule = {
    deleteDefault: function(topic, subscription) {
      serviceBusService.deleteRule(topic,
        subscription,
        azure.Constants.ServiceBusConstants.DEFAULT_RULE_NAME,
        rule.handleError);
    },
    create: function(topic, subscription, filter) {
      var ruleOptions = {
        sqlExpressionFilter: filter
      };
      rule.deleteDefault(topic, subscription);
      serviceBusService.createRule(topic,
        subscription,
        subscription + 'Filter',
        ruleOptions,
        rule.handleError);
    },
    handleError: function(error) {
      if (error) {
        console.log('rule creation failed: ', error);
      }
    }
  };

  var createSubscription = function(topic, subscription, filter) {
    serviceBusService.createSubscription(topic, subscription, function(error) {
      if (!error) {
        if (filterName) {
          rule.create(topic, subscription, filter);
        }
        console.log("success");
        // subscription created
      } else {
        console.log("failed to create subscription", error);
      }
    });
  };

  serviceBusService.getSubscription(topicName, subscriptionName, function(error, result) {
    if (error) {
      if (error.statusCode === 404) {
        createSubscription(topicName, subscriptionName, filterName);
      } else {
        console.log('getSubscription error: ', subscriptionName, topicName, error);
      }
    } else if (result) {
      console.log('Error: Subscription already exists: ', result);
    }
  });
}