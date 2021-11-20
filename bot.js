const Discord = require("discord.js");
const Database = require("nukleon");
const fetch = require("node-fetch");
const express = require("express");
const os = require('os');
const moment = require('moment');
require('moment-duration-format')

let db = new Database("./Database/LinkDB.json");
let sdb = new Database("./Database/SayıDB.json");
let client = new Discord.Client();
let app = express();

client.on("ready", () => {
  console.log("Bot " + client.user.tag + " kullanıcı adıyla aktif!");
  client.user.setStatus('idle');
  client.user.setActivity('go!yardım & go!ekle')
});

setInterval(() => {
  var links = db.get("linkler");
  if (!links) return;
  var linkA = links.map(c => c.url);
  linkA.forEach(link => {
    try {
      fetch(link);
    } catch (e) {
      console.log("" + e);
    }
  });
  console.log(links.length + " Proje Pinglendi!");
}, 60000);

client.on("ready", () => {
  if (!Array.isArray(db.get("linkler"))) {
    db.set("linkler", []);
  }
});

client.on("message", message => {
  if (message.author.bot) return;
  var spl = message.content.split(" ");
  if (spl[0] == "go!ekle") {
    var link = spl[1];
    fetch(link)
      .then(() => {
        let usayi = sdb.get(`uptimesayi_${message.author.id}`);

        if (usayi>5) {
          let besüstü = new Discord.MessageEmbed()
            .setAuthor(client.user.username,client.user.avatarURL())
            .setDescription(`**5 Adet Üstü Proje Eklediğiniz İçin Yeni Proje Ekleyemezsiniz!**`)
            .setThumbnail(message.author.avatarURL())
            .setTimestamp()
          message.channel.send(besüstü);
        } else return;

        if (db.al("linkler").map(z => z.url).includes(link)) return message.channel.send(new Discord.MessageEmbed() .setAuthor(message.author.username, message.author.avatarURL({format: 'png'})) .setDescription(`**Bu Link Zaten \`Uptime Go\` Tarafından 7/24 Aktif Tutulmakta!**`) .setThumbnail(message.author.avatarURL({type: 'png'})) .setTimestamp());
        message.delete();
        message.channel.send(new Discord.MessageEmbed() .setAuthor(message.author.username, message.author.avatarURL({format: 'png'})) .setDescription(`**Projeniz Başarıyla Sisteme Eklendi!**`) .setThumbnail(message.author.avatarURL({type: 'png'})) .setTimestamp());
        db.push("linkler", { url: link, owner: message.author.id });
        sdb.add(`uptimesayi_${message.author.id}`, 1);
      })
      .catch(e => {
        return message.channel.send(new Discord.MessageEmbed() .setAuthor(message.author.username, message.author.avatarURL({format: 'png'})) .setDescription(`**Lütfen Bir Link Giriniz.**`) .setThumbnail(message.author.avatarURL({type: 'png'})) .setTimestamp());
      });
  }
});

client.on("message", message => {
  if (message.author.bot) return;
  var spl = message.content.split(" ");
  if (spl[0] == "go!göster") {
    var link = spl[1];
    let eklemissin = sdb.get(`uptimesayi_${message.author.id}`)
    if (eklemissin===null||eklemissin===undefined) {eklemissin=0};
    message.channel.send(new Discord.MessageEmbed() .setAuthor(message.author.username, message.author.avatarURL({format: 'png'})) .setDescription(`**\`${db.get("linkler").length}\` Proje Aktif Tutuluyor!**\n\`${eklemissin}\` Proje Eklemişsin!**`) .setThumbnail(message.author.avatarURL({type: 'png'})) .setTimestamp());
  }
});

client.on("message", message => {
  if (message.author.bot) return;
  var spl = message.content.split(" ");
  if (spl[0] == "go!yardım") {
    var link = spl[1];
    message.channel.send(new Discord.MessageEmbed().setDescription('**<:uptimego_panda:831894743977689099> go!ekle <Link> ・ Belirttiğiniz Linki Sisteme Ekler.\n<:uptimego_panda:831894743977689099> go!göster ・ Aktif Tutulan Proje Sayısını Gösterir.\n<:uptimego_panda:831894743977689099> go!istatistik ・ Botun İstatistiklerini Gösterir.**').setFooter('Menü ' + message.author.username + ' Tarafından İstendi').setTimestamp().setAuthor(client.user.username, client.user.avatarURL({type: 'png'})).setThumbnail(message.author.avatarURL()));
}});

client.on('message', async(message,args) => {
  if (message.content.toLowerCase === 'go!istatistik' || message.content.toLowerCase() === 'go!i') {
    const calismasuresi = moment.duration(client.uptime).format(" D [Gün], H [Saat], m [Dakika], s [Saniye]");

    let istatistik = new Discord.MessageEmbed()    
      .addField('**__Bot Verileri__**', `**${client.guilds.cache.size} Sunucu\n${client.channels.cache.size} Kanal\n${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} Kullanıcı**`, true)
      .addfield('**__Sürümler__**', `**DiscordJS : v${Discord.version}\nNodeJS : ${process.version}**`, true)
      .addField('**__Gecikmeler__**', `**Bot Gecikmesi : ${client.ws.ping} Ms\nMesaj Gecikmesi : ${new Date().getTime() - message.createdTimestamp} Ms**`, true)
      .addField('**__Çalışma Süresi__**', `**${calismasuresi}**`, true)
      .setThumbnail(message.author.avatarURL())
      .setTimestamp()
      .setAuthor(client.user.username, client.user.avatarURL())
    message.channel.send(istatistik);
  }
});

app.get('/', function (req,res) { res.send("`Uptime Go` Pinglendi!") })

app.listen(3000)
client.login(process.env.token);
