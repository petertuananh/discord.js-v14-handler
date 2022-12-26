const fs = require('fs');
const ascii = require('ascii-table');

let table = new ascii('Slash Commands');
table.setHeading('List', ' Status');

module.exports = (yourauth) => {
    let slashcommands = []
	fs.readdirSync('./commands/slash').forEach(dir => {
		const commands = fs.readdirSync(`./commands/slash/${dir}/`).filter(file => file.endsWith(".js"));

		for (let file of commands) {
            let pull = require(`../commands/slash/${dir}/${file}`);

            if (pull.name) {
                yourauth.slashcommands.set(pull.name, pull);
                slashcommands.push(pull);
                table.addRow(file, `Success ✔`);
                continue;
            } else {
                table.addRow(file, `Error ✖`);
                continue;
            }
		}
	});
	if(yourauth.config.setting.devMode){
        console.log(table.toString());
    }else{

    }

    yourauth.on('ready', async () => {
        await yourauth.application.commands.set(slashcommands)
    })
};