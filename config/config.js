var config = {
	ipaddress: "127.0.0.1",
	port: 3000,
	SALT_WORK_FACTOR: 10
}

config.ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
config.port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

module.exports = config;