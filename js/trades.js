// trades generate


var data;

// import
function open_import_window() {
    let em_window = document.createElement('span');
    em_window.classList.add('window');
    em_window.setAttribute('id','import_window');

    em_window.innerHTML = (`
        <div class="cover"><img src="https://sky.plexion.dev/wall/mine.png"></div>
        <div class="header" style="text-align: center;"><h4>Import data</h4></div>
        <div class="info" style="text-align: center;">
            <p>Import villager trades data in <a href="https://github.com/plexiondev/trades/wiki/Creating-a-suitable-JSON-file">this format</a>.</p>
            <br>
            <textarea class="generic" type="text" id="input" placeholder="Enter input.." style="width: 420px; height: 200px;"></textarea>
        </div>
        <div class="actions">
            <a role="button" class="button focus sheared small" onclick="import_data()"><span class="content">Import</span></a>
            <a role="button" class="button sheared small" onclick="exit_windows()"><span class="content">Cancel</span></a>
        </div>
    `);

    // append
    document.getElementById('window_parent').appendChild(em_window);
    feather.replace();
}

function import_data() {
    select(document.getElementById('input').value);
    exit_windows();
}

// fill up select
function select(response) {
    data = JSON.parse(response);

    for (let i in data.trades) {
        let em_option = document.createElement('option');
        em_option.value = `${data.trades[i].id}`;
        em_option.innerHTML = `${data.trades[i].name} (${data.trades[i].id})`;

        // append
        document.getElementById('trade').appendChild(em_option);
    }

    document.getElementById('action.generate').setAttribute('onclick','call_gen()');
    document.getElementById('action.generate').classList.remove('shine');
    document.getElementById('action.generate').innerHTML = `<span class="content">Generate</span>`;
}

function call_gen() {
    generate(document.getElementById('trade').value);
}


// generate
function generate(trade) {
    document.getElementById('output').innerHTML = '';
    document.getElementById('table-body').innerHTML = (`
    <tr>
        <th></th>
        <th>Name</th>
        <th class="arrow-get"></th>
        <th></th>
        <th>Name</th>
        <th></th>
    </tr>
    `);

    let name;

    for (let i in data.trades) {
        if (data.trades[i].id == trade) {
            name = data.trades[i].name;
        }
    }

    document.getElementById('attr.name').textContent = `${name}`;

    // assemble json
    var object = {display:{},EntityTag:{}};

    // spawn egg display (name)
    object.display = {Lore:[`{"text":"Name: ${name}","color":"gray","italic":false}`]};
    
    // active effects
    //object.EntityTag = {ActiveEffects:[]}
    //for (let i in active_effects) {
    //    object.EntityTag.ActiveEffects.push({Id:active_effects[i],Amplifier:255,Duration:99999,ShowParticles:0});
    //}

    // entity data
    object.EntityTag.CustomName = `{"text":"${name}"}`;
    object.EntityTag.NoAI = 1;
    object.EntityTag.Offers = {Recipes:[]};


    // loop through rates
    for (let n in data) {
        if (n != 'trades') {
            // not trades array

            for (let i in data[n]) {
                // valid trade?
                let match = false;
                for (let t in data[n][i].trades) {
                    if (data[n][i].trades[t] == trade) { match = true }
                }
                if (match == true) {
                    // if valid

                    // buy
                    var buy_name = data[n][i].buy.id;
                    var buy_description = '';
                    var buy_model = '';
                    var buy_enchants= [];
                    var buy_damage = 0;
                    var buy_unbreakable = 0;
                    // sell
                    var sell_name = data[n][i].sell.id;
                    var sell_description = '';
                    var sell_model = '';
                    var sell_enchants = [];
                    var sell_damage = 0;
                    var sell_unbreakable = 0;

                    // advanced nbt
                    try {
                        var buy_data = nbt('buy',{},n,i);
                        var sell_data = nbt('sell',{},n,i);

                        buy_nbt = buy_data[0]
                        sell_nbt = sell_data[0]

                        if (buy_data[1] != '') { buy_name = buy_data[1] }
                        if (buy_data[2] != '') { buy_description = buy_data[2] }
                        if (buy_data[3] != '') { buy_model = buy_data[3] }
                        if (buy_data[4] != '') { buy_enchants = buy_data[4] }
                        if (buy_data[5] != 0) { buy_damage = buy_data[5] }
                        if (buy_data[6] != 0) { buy_unbreakable = buy_data[6] }

                        if (sell_data[1] != '') { sell_name = sell_data[1] }
                        if (sell_data[2] != '') { sell_description = sell_data[2] }
                        if (sell_data[3] != '') { sell_model = sell_data[3] }
                        if (sell_data[4] != '') { sell_enchants = sell_data[4] }
                        if (sell_data[5] != 0) { sell_damage = sell_data[5] }
                        if (sell_data[6] != 0) { sell_unbreakable = sell_data[6] }
                    } catch(error) { }

                    // buy & sell data
                    var items = {};

                    // buy item
                    items.buy = {id:`${data[n][i].buy.id}`,Count:data[n][i].buy.count};
                    if (typeof buy_nbt != 'undefined') { items.buy.tag = buy_nbt; }

                    // sell item
                    items.sell = {id:`${data[n][i].sell.id}`,Count:data[n][i].sell.count};
                    if (typeof sell_nbt != 'undefined') { items.sell.tag = sell_nbt; }

                    // disable locking trades
                    items.priceMultipler = 0.0;
                    items.maxUses = 2147483647;
                    items.demand = 0;
                    items.specialPrice = 0;

                    // append to offers
                    object.EntityTag.Offers.Recipes.push(items);


                    // visually display enchant in preview
                    let buy_enchant = '';
                    let sell_enchant = '';
                    // check for enchants
                    if (buy_enchants.length > 0) { buy_enchant = ' enchant'; }
                    if (sell_enchants.length > 0) { sell_enchant = ' enchant'; }

                    // format enchants
                    let format_buy_enchants = '';
                    let format_sell_enchants = '';
                    for (let e in buy_enchants) { format_buy_enchants = `${format_buy_enchants}${buy_enchants[e].id} ${buy_enchants[e].lvl} `; }
                    for (let e in sell_enchants) { format_sell_enchants = `${format_sell_enchants}${sell_enchants[e].id} ${sell_enchants[e].lvl} `; }

                    // record
                    let em_record = document.createElement('tr');
                    em_record.innerHTML = (`
                    <th class="icon${buy_enchant}"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${data[n][i].buy.id}.png"</div></th>
                    <th class="name has-tooltip${buy_enchant}" title="${buy_description} ${format_buy_enchants}">${buy_name}<label class="count">${data[n][i].buy.count}</label></th>
                    <th class="arrow-get"><i class="icon w-24" data-feather="arrow-right"></i></th>
                    <th class="icon${sell_enchant}"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${data[n][i].sell.id}.png"</div></th>
                    <th class="name has-tooltip${sell_enchant}" title="${sell_description} ${format_sell_enchants}">${sell_name}<label class="count">${data[n][i].sell.count}</label></th>
                    `);


                    // append
                    document.getElementById(`table-body`).appendChild(em_record);
                }
                feather.replace();
            }
        }
    }

    // display output
    let output = `give @p villager_spawn_egg${JSON.stringify(object)}`;
    document.getElementById('output').innerHTML = `${output}`;
}

// parse nbt
function nbt(type,nbt,n,i) {
    let custom_name = '';
    let custom_description = '';
    let custom_model = '';
    let custom_enchants = [];
    let damage = 0;
    let unbreakable = 0;

    for (let x in data[n][i][`${type}`].nbt) {
        if (x == 'name') {
            if (typeof nbt.display == 'undefined') { nbt.display = {} }
            custom_name = data[n][i][`${type}`].nbt.name;
            nbt.display.Name = `{"text":"${data[n][i][`${type}`].nbt.name}","italic":false}`;
        } else if (x == 'description') {
            if (typeof nbt.display == 'undefined') { nbt.display = {} }
            custom_description = data[n][i][`${type}`].nbt.description;
            nbt.display.Lore = [`{"text":"${data[n][i][`${type}`].nbt.description}","italic":false,"color":"gray"}`];
        } else if (x == 'model') {
            custom_model = data[n][i][`${type}`].nbt.model;
            nbt.CustomModelData = data[n][i][`${type}`].nbt.model;
        } else if (x == 'enchants') {
            if (typeof nbt.Enchantments == 'undefined') { nbt.Enchantments = [] }
            custom_enchants = data[n][i][`${type}`].nbt.enchants;
            for (let e in data[n][i][`${type}`].nbt.enchants) {
                nbt.Enchantments.push({id:`minecraft:${data[n][i][`${type}`].nbt.enchants[e].id}`,lvl:data[n][i][`${type}`].nbt.enchants[e].lvl});
            }
        } else if (x == 'damage') {
            damage = data[n][i][`${type}`].nbt.damage;
            nbt.Damage = data[n][i][`${type}`].nbt.damage;
        } else if (x == 'unbreakable') {
            unbreakable = data[n][i][`${type}`].nbt.unbreakable;
            nbt.Unbreakable = data[n][i][`${type}`].nbt.unbreakable;
        }
    }

    return [nbt,custom_name,custom_description,custom_model,custom_enchants,damage,unbreakable];
}

// copy
function copy() {
    var selector = document.getElementById('output');

    // write to clipboard
    navigator.clipboard.writeText(selector.textContent);
}