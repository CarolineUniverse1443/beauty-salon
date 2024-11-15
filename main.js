const app = {
    data() {
        return {
            error: '',
            errors: [],
            client: [],
            clients: [],
            orders: [],
            materials: [],
            services: [],
            form: {
                client_name: '',
                client_phone: '',
                password: '',
                client_id: '',
                service_id: '',
                favor_id: '',
                employee_id: '',
                data: '',
                time: '',
                name: '',
                price: ''
            },
            page: 'home',
            section: 'main',
            role: 'user',
            isAdmin: false,
            token: null,
            // page: 'private',
            table: '',
            finder: '',
            option: 'add',
            isLoading: true,
        }
    },
    watch: {
        finder() {
            if(this.finder == '') this.getEntries(this.table)
            else{
                fetch(`http://style/api/${this.table}/${this.finder}`)
                    .then(response => response.json())
                    .then(entry => {
                        if(this.table == 'orders') this.orders = [entry]
                        if(this.table == 'clients') this.clients = [entry]
                        if(this.table == 'services') this.services = [entry]   
                        if(this.table == 'materials') this.materials = [entry]
                    })
            }
        }
    },
    created()
    {
        let cookie_token = document.cookie.split(';')
        if(this.getCookie('cookie_token') != 'null')
        {
            this.token = this.getCookie('cookie_token')
            console.log(this.token)
        }
        // document.cookie = "token=sr7fXcaqvwAU4XQbDyyH9X00teVS4PupmVrDoVppTj1oBEXmYi; max-age=-1";
    },
    methods: {
        register(){
            console.log(this.form)
            fetch('http://style/api/register', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.form)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data.error) {
                    console.log(data.errors)
                    this.errors = data.errors
                } else {
                    this.page = 'login'
                    this.errors = []
                }
                
            }) 
        },
        signin(){
            console.log(this.form)
            fetch('http://style/api/signin', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.form)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data.error) {
                    console.log(data.errors)
                    if (data.error !== true) {
                        this.error = data.error
                        this.errors = []
                    } else {
                        this.errors = data.errors
                    }
                } else {
                    this.page = 'home'
                    this.section = 'main'
                    this.role = data.role
                    this.token = data.token
                    document.cookie = `cookie_token=${this.token}`
                    this.errors = []
                    this.form.client_phone = ''
                    this.form.password = ''
                    this.form.client_id = data.id
                }
            }) 
        },
        getCookie(name) {
            let matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },
        logout()
        {
            fetch('http://style/api/logout', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.getCookie('cookie_token')
                },
                body: JSON.stringify(this.form)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                this.page = 'home'
                this.role = 'user'
                this.section = 'main'
                this.table = ''
                this.token = null
                this.error = ''
                document.cookie = `cookie_token=null`
                console.log(localStorage.getItem('cookie_token'))
            })
        },
        getEntries(table)
        {
            this.isLoading = true

            if(this.role == 'admin' || this.token == null) {
                console.log('all')
                fetch(`http://style/api/${table}`)
                .then(response => response.json())
                .then(entries => {
                    console.log(entries)
                    if(table == 'orders') this.orders = entries
                    if(table == 'clients') this.clients = entries
                    if(table == 'services') this.services = entries
                    if(table == 'materials') this.materials = entries
                    
                    if(this.role == 'admin') this.table = table
                    this.isLoading = false
                    this.error = ''
            })  
            }
            else if(this.token) {
                console.log('user')
                fetch(`http://style/api/${table}?user_id=${this.token}`)
                .then(response => response.json())
                .then(entries => {
                    console.log(entries)
                    this.order = this.orders = entries
                    this.error = ''
            })
            }
            else {
                console.log('error')
            }
        },
        myEntries(){
            this.page = 'private'
            this.table = 'orders'
            this.error = ''
            this.getEntries(this.table)
        },
        add_service()
        {
            console.log(this.form)
            fetch('http://style/api/services', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token
                },
                body: JSON.stringify(this.form)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                this.getEntries(this.table)
                this.form.name = ''
                this.form.price = ''
            })
        },
        add_order()
        {
            console.log(this.form)
            fetch('http://style/api/orders', {
                method: 'post',
                // mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token,
                },
                body: JSON.stringify(this.form)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                this.getEntries(this.table)
                this.form.client_id = ''
                this.form.favor_id = ''
                this.form.employee_id = ''
                this.form.data = ''
                this.form.time = ''
            })
        },
        battery(id, name, price)
        {
            this.option = 'edit'
            this.form.service_id = id
            this.form.name = name
            this.form.price = price
        },
        battery2(id, client, service, employee, data, time)
        {
            this.option = 'edit'
            this.form.order_id = id
            this.form.client_id = client
            this.form.favor_id = service
            this.form.employee_id = employee
            this.form.data = data
            this.form.time = time
        },
        update_service(id)
        {
            console.log(this.form)

            fetch(`http://style/api/services/${id}`, {
                method: 'patch',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token
                },
                body: JSON.stringify(this.form)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                this.option = 'add'
                this.getEntries(this.table)
                this.form.service_id = ''
                this.form.name = ''
                this.form.price = ''
            })
        },
        update_order(id, date)
        {
            console.log(this.form)
            if(this.role == 'admin' || Date.parse(date) > Date.now())
            {
                // console.log(Date.parse(date), Date.now())
                fetch(`http://style/api/orders/${id}`, {
                    method: 'patch',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.token
                    },
                    body: JSON.stringify(this.form)
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    this.option = 'add'
                    this.getEntries(this.table)
                    this.error = ''
                })
            }
            else {
                // console.log('Вы не можете изменить эту запись')
                this.error = 'Вы не можете изменить эту запись об услуге, т.к. дата ее оказания уже наступила'
            }
            this.form.order_id = ''
            this.form.client_id = ''
            this.form.favor_id = ''
            this.form.employee_id = ''
            this.form.data = ''
            this.form.time = ''
        },
        deleteEntry(id, table, date)
        {
            if(this.role == 'admin' || Date.parse(date) > Date.now())
            {
                fetch(`http://style/api/${table}/${id}`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.token
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        this.getEntries(this.table)
                    }) 
            }
            else
            {
                this.error = 'Вы не можете удалить эту запись об услуге, т.к. дата ее оказания уже наступила'
            }
        },
    }
}

Vue.createApp(app).mount('#app')