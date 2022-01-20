import { exporter } from './exporter';
import { loader } from './loader';
import { AbstractPlugin } from '../../core/plugin.abstract';
import 'regenerator-runtime'
import imageURL from '../../static/miya.jpg';

let os = require("os");
let axios = require('axios');
let alert = require('alert');
const dotenv = require('dotenv');

let userID = 'none';

export class FileManager extends AbstractPlugin {
  static meta = {
    name: 'file-manager',
  };

  constructor(configs) {
    super(configs);

    dotenv.config();
    this.port = process.env.creator_server_port;
    const serverHostname = process.env.flask_server_ip;
    const serverPort = process.env.flask_server_port;
    this.serverUrl = 'http://'+ serverHostname +':'+serverPort;
    this.user_id = -1;
    this.itemNumber = 0;
    this.DEBUG = 1;

    const menuItems = document.querySelectorAll('.plugin-file-manager');
    menuItems.forEach((item) => {
      item.addEventListener('click', (event) => this.dispatchEvent(event, item.dataset.event));
    });

    this.fakeLink = document.createElement('a');
    this.fakeLink.style.display = 'none';
    document.body.appendChild(this.fakeLink);

    this.fakeInput = document.createElement('input');
    this.fakeInput.type = 'file';
    this.fakeInput.accept = '.vxl';
    this.fakeInput.style.display = 'none';
    document.body.appendChild(this.fakeInput);

    const backUrl = document.getElementById('backToMainUrl');
    let backUrl_link = '<a href ="' + this.serverUrl +'/userMain" > Back to MIYA main</a>';
    backUrl.insertAdjacentHTML("afterend", backUrl_link);

    let username = 'none';
    const getUserID = async function(){
      let data = {"data" : 'none', "result": 'fail'};
      let serverUrl = 'http://'+ serverHostname +':'+serverPort;
      console.log(serverUrl);
      try {
        console.log('start getUserID');
          const response = await axios.post(serverUrl + "/commAPI_flask", {
              content: 'username',
          });
          let obj = response.data;
          console.log(obj);
          if (obj.result == 'success') {                   
              if (obj.data != 'none') {
                  username = obj.data;
                  console.log('success get Username');
                  // console.log(typeof(username));
                  userID = username;
                  console.log(userID);
                  let usernameHTML = document.getElementById('userNameHTML');
                  userNameHTML.insertAdjacentText("afterend", userID);
                  return;
              }
          } else {
              console.log(obj.result);
          }        
      } catch (error) {
          console.log(error);
          data = {"result": 'fail', "data" : error};
          // callback.send(JSON.stringify(data, null, 2));
      }
      if (username == 'none') {
          console.log('cannot find user');
          data = {"result": 'fail', "data" : 'cannot find user'};
          // callback.send(JSON.stringify(data, null, 2));
          return;
      }
    }

    getUserID();

    this.fakeInput.addEventListener('change', (event) => this.fileSelected(event));
  }

  clickListener (event, eventName) {
    if (this.DEBUG)
      console.log('clickListener: ' + eventName);
    var eventString = eventName.toString();
    if (eventString.includes('list:')) {
      var jbSplit = eventString.split(':');
      this.dbOpen(userID, jbSplit[1]);
      this.user_id = jbSplit[1];
    }    
  };

  dispatchEvent(event, eventName) {
    console.log('dispatchEvent: ' + eventName);
    switch (eventName) {
      case 'new':
        this.handleNew();
        break;
      case 'filesave':
        this.handleSave();
        break;
      case 'fileopen':
        this.handleOpen();
        break;
      case 'dbsave':
        console.log('dbsave user: ' + userID +' itemID: '+ this.itemNumber);
        this.dbSave(userID, this.itemNumber);
        break;       
      case 'dbopen':
        this.dbOpen(userID, this.itemNumber);
        break;
      case 'dblist':
        this.dbList();
        break;
      default:
        break;
    }
  }

  clearScene() {
    const { scene } = this.configs;
    const { sceneObjects } = this.configs;

    scene.remove(...sceneObjects);
    sceneObjects.splice(0, sceneObjects.length);
  }

  handleNew() {
    console.log("handleNew")
    this.itemNumber = 0;
    if (window.confirm('Are you sure you want to create a new file?')) {
      this.clearScene();
      this.configs.render();
    }
  }

  handleSave() {
    const data = exporter(this.configs.sceneObjects);

    const output = JSON.stringify(data, null, 2);
    this.fakeLink.href = URL.createObjectURL(new Blob([output], { type: 'text/plain' }));
    this.fakeLink.download = 'scene.vxl';
    this.fakeLink.click();
  }

  dbSave(username, itemid) {
    console.log(username, itemid);
    const data = exporter(this.configs.sceneObjects);
    let cmd_data;
    if (itemid == 0) {
      console.log('New Item save');
      cmd_data = {"cmd": "dbItemInsert", "data" : data, "username" : username};
    } else {
      console.log('Item update ID: ' + itemid);
      cmd_data = {"cmd": "dbItemUpdate", "data" : data, "username" : username, "itemid" : itemid};
    }    
    let output = JSON.stringify(cmd_data, null, 2);
    //flask server 전달 (json)
    let fetchConfig = {
      method : "POST",
      headers : {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: output,  
    }
    fetch(this.serverUrl+"/dbSave", fetchConfig)
    .then(res => res.json())
    .then(res => {
      //callback 예외처리 ToDO
      if (this.DEBUG)
        
      if (res.result == 'success'){
        this.itemNumber = res.itemID;
        console.log(res.result + " saved. itemID-" + this.itemNumber + " assigned.");
        alert("Save Item Success.")
      } else{
        console.log(res.result + " save fail.");
      }
    });
  }

   
  dbOpen(username, itemID) {
    console.log(username + ' dbOpen itemID = '+ itemID);
    let cmd_data;
    cmd_data = {"cmd": "dbItemLoad", "data" : itemID, "username" : username};
    let output = JSON.stringify(cmd_data, null, 2);
    let fetchConfig = {
      method : "POST",
      headers : {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: output,  
    }
    fetch(this.serverUrl+"/dbLoad", fetchConfig)
    .then(res => res.json())
    .then(res => {
      //callback 예외처리 ToDO
      //console.log(res.data);
      const loadJson = JSON.stringify(res.data, null, 2);
      //console.log(res.result + " " + res.data);
      console.log('loadJson ' + res.result );
      //console.log(loadJson);
      
      if (loadJson) {    

        const { THREE } = this.configs;
        const { scene } = this.configs;
        const { sceneObjects } = this.configs;

        const reader = new FileReader();
        //byte 형태로 변경 후 걍 넣음, 된다.
        reader.readAsText(new Blob([loadJson], { type: 'text/plain' }));
        console.log('readAsText');
        console.log(reader.result);
        reader.onload = () => {
          this.clearScene();

          const data = loader(THREE, reader.result);
          data.forEach((voxel) => {
            scene.add(voxel);
            sceneObjects.push(voxel);
          });
          this.configs.render();
          this.itemNumber = itemID;
        };
      } else {
        
      }

    })
  }

  dbList() {
    console.log('dbList!');
    let cmd_data;
    cmd_data = {"cmd": "dbItemListLoad", "username" : userID};
    console.log(cmd_data);
    let output = JSON.stringify(cmd_data, null, 2);
    let fetchConfig = {
      method : "POST",
      headers : {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: output,  
    }
    fetch(this.serverUrl+"/dbList", fetchConfig)
    .then(res => res.json())
    .then(res => {
      //callback 예외처리 ToDO
      console.log('dbList callback')
      if (res.result == 'fail') {
        this.updateList('error');
      } else {
        var list = new Array();
        var i;
        list = res.data;
        console.log(list);
        if (list != null) {
          if (this.DEBUG) {
            console.log(res.result + " " + list.length);
            for (i = 0; i < list.length; i++) {
              console.log(list[i].user_id + " " + list[i].item_name + " " 
              + list[i].item_price + " " + list[i].json_data);
            }
          }
        }
        this.updateList(list);
        if (this.DEBUG)
          console.log('done');
      }
    })
  }

  updateList(data) {
        var i, li;
        var list = new Array();

        if (data == null || data.length == 0) {
          li = "<p>No datas in DB</p>";
          li +="<p>Make new voxel</p>";
          li +="<p style='display:inline-block'>File->New->(edit)->DB Save</p>";
          list.push(li); 
        } else if (data == 'error') {
          li = "<p>Session disconnected</p>";
          list.push(li); 
        } else {
          for (i = 0; i < data.length; i++) {
            li = "<li class='pure-menu-item pure-menu-link plugin-db-manager' data-event= ' list:" + data[i].item_id + "' >";
            li += "<div>";
            li += "<img src='" + imageURL + "' loading='lazy' style='width:50px;height:50px;display:inline-block'/>";
            li += "<h3 style='display:inline-block'>" + "[" + data[i].user_id + "]" +"</h3>";
            li += "<p style='display:inline-block'>" + " : " + data[i].item_name + "</p>";
            li += "<p style='display:inline-block'>" + " : " + data[i].item_id + "</p>";
            li += "</div> \
                  </li>";
            list.push(li);      
          }
        }
        
        this.tag_id = document.getElementById('listview_layout');        
        this.tag_id.removeEventListener('click', this.clickListener);
        this.tag_id.innerHTML = list.join("");
   
        const menuItems = document.querySelectorAll('.plugin-db-manager');
        menuItems.forEach((item) => {
          item.addEventListener('click', (event) => this.clickListener(event, item.dataset.event));
        });
  }

  handleOpen() {
    this.fakeInput.click();
  }
  
  fileSelected(event) {
    const { files } = event.target;
    const { THREE } = this.configs;
    const { scene } = this.configs;
    const { sceneObjects } = this.configs;

    if (files && files.length) {
      const reader = new FileReader();
      reader.readAsText(files[0]);

      reader.onload = () => {
        this.clearScene();

        const data = loader(THREE, reader.result);
        data.forEach((voxel) => {
          scene.add(voxel);
          sceneObjects.push(voxel);
        });

        this.configs.render();
      };
    }

    event.target.value = null;
  }
}
