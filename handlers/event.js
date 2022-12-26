const fs = require('fs');

module.exports = (yourauth) => {
    fs.readdirSync('./events/').forEach(dir => {
        const events = fs.readdirSync(`./events/${dir}/`).filter(file => file.endsWith('.js'));
        for (let file of events) {
            let pull = require(`../events/${dir}/${file}`);
            if (pull.name) {
                yourauth.events.set(pull.name, pull);
            } else {
                continue;
            }

        }
    });
    if (yourauth.config.setting.devMode) {
        console.log(`Loaded all events!`);
    } else {

    }
}