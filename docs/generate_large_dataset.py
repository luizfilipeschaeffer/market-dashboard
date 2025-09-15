import csv
import random
from datetime import datetime, timedelta
import os

# Lista de nomes de empresas para gerar clientes realistas
company_names = [
    "Soluções Empresariais", "Tech Solutions", "Inovação Digital", "Sistemas Integrados", "DataGuard Brasil",
    "Cloud Masters", "Alpha Data Center", "Beta Solutions", "Digital Systems", "TechCorp Brasil",
    "Inovação Tech", "DataFlow Solutions", "CloudTech Brasil", "SecureData", "InfoSystems",
    "TechBridge Corp", "DataVault Brasil", "CloudFirst", "TechNova Solutions", "DataCore Systems",
    "Inovação Data", "TechFlow Corp", "CloudSecure", "DataTech Brasil", "TechInnovate",
    "CloudBridge Solutions", "DataStream Corp", "TechVault", "CloudData Systems", "DataInnovate",
    "TechMax", "DataPro", "CloudPro", "TechCore", "DataCore", "CloudMax", "TechFlow", "DataFlow",
    "CloudTech", "TechData", "DataTech", "CloudData", "TechCloud", "DataCloud", "CloudFlow",
    "TechStream", "DataStream", "CloudStream", "TechBridge", "DataBridge", "CloudBridge",
    "TechVault", "DataVault", "CloudVault", "TechSecure", "DataSecure", "CloudSecure",
    "TechFirst", "DataFirst", "CloudFirst", "TechNova", "DataNova", "CloudNova",
    "TechInnovate", "DataInnovate", "CloudInnovate", "TechDigital", "DataDigital", "CloudDigital",
    "TechSystems", "DataSystems", "CloudSystems", "TechCorp", "DataCorp", "CloudCorp",
    "TechLabs", "DataLabs", "CloudLabs", "TechWorks", "DataWorks", "CloudWorks",
    "TechGroup", "DataGroup", "CloudGroup", "TechTeam", "DataTeam", "CloudTeam",
    "TechPartners", "DataPartners", "CloudPartners", "TechAlliance", "DataAlliance", "CloudAlliance",
    "TechNetwork", "DataNetwork", "CloudNetwork", "TechConnect", "DataConnect", "CloudConnect",
    "TechLink", "DataLink", "CloudLink", "TechHub", "DataHub", "CloudHub",
    "TechCenter", "DataCenter", "CloudCenter", "TechBase", "DataBase", "CloudBase",
    "TechZone", "DataZone", "CloudZone", "TechSpace", "DataSpace", "CloudSpace",
    "TechPlace", "DataPlace", "CloudPlace", "TechSpot", "DataSpot", "CloudSpot",
    "TechPoint", "DataPoint", "CloudPoint", "TechNode", "DataNode", "CloudNode",
    "TechGrid", "DataGrid", "CloudGrid", "TechWeb", "DataWeb", "CloudWeb",
    "TechNet", "DataNet", "CloudNet", "TechMesh", "DataMesh", "CloudMesh",
    "TechFabric", "DataFabric", "CloudFabric", "TechMatrix", "DataMatrix", "CloudMatrix",
    "TechArray", "DataArray", "CloudArray", "TechVector", "DataVector", "CloudVector",
    "TechScalar", "DataScalar", "CloudScalar", "TechTensor", "DataTensor", "CloudTensor",
    "TechQuantum", "DataQuantum", "CloudQuantum", "TechNeural", "DataNeural", "CloudNeural",
    "TechAI", "DataAI", "CloudAI", "TechML", "DataML", "CloudML",
    "TechDL", "DataDL", "CloudDL", "TechNN", "DataNN", "CloudNN",
    "TechGPU", "DataGPU", "CloudGPU", "TechCPU", "DataCPU", "CloudCPU",
    "TechRAM", "DataRAM", "CloudRAM", "TechSSD", "DataSSD", "CloudSSD",
    "TechHDD", "DataHDD", "CloudHDD", "TechNVMe", "DataNVMe", "CloudNVMe",
    "TechSATA", "DataSATA", "CloudSATA", "TechPCIe", "DataPCIe", "CloudPCIe",
    "TechUSB", "DataUSB", "CloudUSB", "TechThunderbolt", "DataThunderbolt", "CloudThunderbolt",
    "TechEthernet", "DataEthernet", "CloudEthernet", "TechWiFi", "DataWiFi", "CloudWiFi",
    "TechBluetooth", "DataBluetooth", "CloudBluetooth", "TechNFC", "DataNFC", "CloudNFC",
    "TechRFID", "DataRFID", "CloudRFID", "TechGPS", "DataGPS", "CloudGPS",
    "TechLTE", "DataLTE", "CloudLTE", "Tech5G", "Data5G", "Cloud5G",
    "Tech4G", "Data4G", "Cloud4G", "Tech3G", "Data3G", "Cloud3G",
    "Tech2G", "Data2G", "Cloud2G", "TechGSM", "DataGSM", "CloudGSM",
    "TechCDMA", "DataCDMA", "CloudCDMA", "TechTDMA", "DataTDMA", "CloudTDMA",
    "TechFDMA", "DataFDMA", "CloudFDMA", "TechOFDMA", "DataOFDMA", "CloudOFDMA",
    "TechMIMO", "DataMIMO", "CloudMIMO", "TechBeamforming", "DataBeamforming", "CloudBeamforming",
    "TechMassive", "DataMassive", "CloudMassive", "TechSmall", "DataSmall", "CloudSmall",
    "TechMacro", "DataMacro", "CloudMacro", "TechMicro", "DataMicro", "CloudMicro",
    "TechPico", "DataPico", "CloudPico", "TechFemto", "DataFemto", "CloudFemto",
    "TechNano", "DataNano", "CloudNano", "TechPico", "DataPico", "CloudPico",
    "TechFemto", "DataFemto", "CloudFemto", "TechAtto", "DataAtto", "CloudAtto",
    "TechZepto", "DataZepto", "CloudZepto", "TechYocto", "DataYocto", "CloudYocto"
]

# Sufixos de empresa
company_suffixes = ["Ltda", "LTDA", "S.A.", "S.A", "ME", "EIRELI", "Corp", "Corporation", "Brasil", "Brazil", "Digital", "Tech", "Data", "Cloud", "Systems", "Solutions", "Group", "Labs", "Works", "Partners", "Alliance", "Network", "Hub", "Center", "Zone", "Space", "Place", "Spot", "Point", "Node", "Grid", "Web", "Net", "Mesh", "Fabric", "Matrix", "Array", "Vector", "Scalar", "Tensor", "Quantum", "Neural", "AI", "ML", "DL", "NN"]

# Estados brasileiros
states = ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "GO", "PE", "CE", "PA", "MT", "MS", "AL", "RN", "PB", "AM", "RO", "AC", "RR", "AP", "TO", "PI", "MA", "SE", "DF"]

# Cidades por estado
cities_by_state = {
    "SP": ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba", "Guarulhos", "São Bernardo do Campo", "Osasco", "Santo André", "São José dos Campos"],
    "RJ": ["Rio de Janeiro", "Niterói", "Nova Iguaçu", "Campos dos Goytacazes", "Duque de Caxias", "São Gonçalo", "Petrópolis", "Volta Redonda", "Macaé", "Cabo Frio"],
    "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga"],
    "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande"],
    "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá"],
    "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí", "Lages", "Jaraguá do Sul", "Palhoça"],
    "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro", "Itabuna", "Lauro de Freitas", "Ilhéus", "Jequié", "Teixeira de Freitas"],
    "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade", "Formosa", "Novo Gama"],
    "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão"],
    "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá"],
    "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas", "Castanhal", "Abaetetuba", "Cametá", "Marituba", "Bragança"],
    "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres", "Sorriso", "Lucas do Rio Verde", "Barra do Garças", "Primavera do Leste"],
    "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Naviraí", "Nova Andradina", "Aquidauana", "Paranaíba", "Sidrolândia"],
    "AL": ["Maceió", "Arapiraca", "Rio Largo", "Palmeira dos Índios", "União dos Palmares", "Penedo", "Coruripe", "Delmiro Gouveia", "São Miguel dos Campos", "Marechal Deodoro"],
    "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Caicó", "Açu", "Currais Novos", "Nova Cruz"],
    "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras", "Guarabira", "Mamanguape", "Monteiro"],
    "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Tefé", "Tabatinga", "Maués", "São Gabriel da Cachoeira", "Lábrea"],
    "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura", "Guajará-Mirim", "Jaru", "Ouro Preto do Oeste", "Buritis"],
    "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó", "Brasiléia", "Xapuri", "Plácido de Castro", "Epitaciolândia", "Mâncio Lima"],
    "RR": ["Boa Vista", "Rorainópolis", "Caracaraí", "Alto Alegre", "Mucajaí", "Bonfim", "Cantá", "Caroebe", "Iracema", "Normandia"],
    "AP": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Porto Grande", "Mazagão", "Vitória do Jari", "Pedra Branca do Amapari", "Serra do Navio", "Amapá"],
    "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins", "Colinas do Tocantins", "Guaraí", "Tocantinópolis", "Miracema do Tocantins", "Dianópolis"],
    "PI": ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior", "Barras", "União", "Altos", "Pedro II"],
    "MA": ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar", "Bacabal", "Balsas", "Pinheiro"],
    "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão", "Estância", "Tobias Barreto", "Simão Dias", "Propriá", "Barra dos Coqueiros"],
    "DF": ["Brasília", "Gama", "Taguatinga", "Ceilândia", "Sobradinho", "Planaltina", "Samambaia", "Santa Maria", "São Sebastião", "Paranoá"]
}

def generate_cnpj():
    """Gera um CNPJ válido"""
    def calc_digit(cnpj, weights):
        total = sum(int(cnpj[i]) * weights[i] for i in range(len(weights)))
        remainder = total % 11
        return 0 if remainder < 2 else 11 - remainder
    
    # Gera os primeiros 12 dígitos
    cnpj = [random.randint(0, 9) for _ in range(12)]
    
    # Calcula os dois dígitos verificadores
    first_digit = calc_digit(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    cnpj.append(first_digit)
    
    second_digit = calc_digit(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    cnpj.append(second_digit)
    
    # Formata o CNPJ
    return f"{cnpj[0]}{cnpj[1]}.{cnpj[2]}{cnpj[3]}{cnpj[4]}.{cnpj[5]}{cnpj[6]}{cnpj[7]}/{cnpj[8]}{cnpj[9]}{cnpj[10]}{cnpj[11]}-{cnpj[12]}{cnpj[13]}"

def generate_phone(state):
    """Gera um telefone baseado no estado"""
    area_codes = {
        "SP": ["11", "12", "13", "14", "15", "16", "17", "18", "19"],
        "RJ": ["21", "22", "24"],
        "MG": ["31", "32", "33", "34", "35", "37", "38"],
        "RS": ["51", "53", "54", "55"],
        "PR": ["41", "42", "43", "44", "45", "46"],
        "SC": ["47", "48", "49"],
        "BA": ["71", "73", "74", "75", "77"],
        "GO": ["62", "64"],
        "PE": ["81", "87"],
        "CE": ["85", "88"],
        "PA": ["91", "93", "94"],
        "MT": ["65", "66"],
        "MS": ["67"],
        "AL": ["82"],
        "RN": ["84"],
        "PB": ["83"],
        "AM": ["92", "97"],
        "RO": ["69"],
        "AC": ["68"],
        "RR": ["95"],
        "AP": ["96"],
        "TO": ["63"],
        "PI": ["86", "89"],
        "MA": ["98", "99"],
        "SE": ["79"],
        "DF": ["61"]
    }
    
    area_code = random.choice(area_codes.get(state, ["11"]))
    number = f"{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
    return f"({area_code}) {number}"

def generate_clients(num_clients=500):
    """Gera lista de clientes"""
    clients = []
    
    for i in range(num_clients):
        # Escolher estado aleatório
        state = random.choice(states)
        city = random.choice(cities_by_state[state])
        
        # Gerar nome da empresa
        company_name = random.choice(company_names)
        suffix = random.choice(company_suffixes)
        full_name = f"{company_name} {suffix}"
        
        # Gerar dados do cliente
        client_id = f"clt_{i+1:03d}"
        cnpj = generate_cnpj()
        email = f"contato@{company_name.lower().replace(' ', '')}.com.br"
        phone = generate_phone(state)
        address = f"{city} - {state}"
        
        # Status baseado em distribuição realista
        status_rand = random.random()
        if status_rand < 0.8:  # 80% ativos
            status = "active"
        elif status_rand < 0.9:  # 10% inativos
            status = "inactive"
        else:  # 10% pendentes
            status = "pending"
        
        # Taxa de sucesso baseada no status
        if status == "active":
            success_rate = random.uniform(0.75, 0.95)
        elif status == "inactive":
            success_rate = random.uniform(0.30, 0.60)
        else:  # pending
            success_rate = random.uniform(0.50, 0.70)
        
        # Tamanho médio de backup
        avg_size = random.uniform(0.5, 5.0)
        
        clients.append({
            "id": client_id,
            "name": full_name,
            "cnpj": cnpj,
            "email": email,
            "phone": phone,
            "address": address,
            "status": status,
            "avg_size": round(avg_size, 2),
            "success_rate": round(success_rate, 2)
        })
    
    return clients

def generate_backup_data(clients, backups_per_client=400):
    """Gera dados de backup para todos os clientes"""
    backup_data = []
    backup_id = 1
    
    # Data de início (400 dias atrás para ter 400 backups por cliente)
    start_date = datetime(2023, 1, 1)
    
    for client in clients:
        current_date = start_date
        
        # Cliente inativo para de fazer backup após 200 dias
        if client["status"] == "inactive":
            end_date_client = start_date + timedelta(days=200)
        else:
            end_date_client = start_date + timedelta(days=400)
        
        backup_count = 0
        while current_date <= end_date_client and backup_count < backups_per_client:
            # Pular fins de semana para alguns clientes (10% dos clientes)
            if random.random() < 0.1 and current_date.weekday() >= 5:
                current_date += timedelta(days=1)
                continue
            
            # Gerar horário de backup
            if random.random() < 0.7:  # 70% backup noturno
                hour = random.randint(23, 23)
            elif random.random() < 0.9:  # 20% backup madrugada
                hour = random.randint(1, 3)
            else:  # 10% backup tarde
                hour = random.randint(22, 23)
            
            minute = random.randint(0, 59)
            backup_time = current_date.replace(hour=hour, minute=minute, second=0)
            
            # Determinar se o backup foi bem-sucedido
            is_success = random.random() < client["success_rate"]
            status = "success" if is_success else "failed"
            
            if is_success:
                # Tamanho baseado na média do cliente com variação
                size_variation = random.uniform(0.8, 1.2)
                size_gb = round(client["avg_size"] * size_variation, 2)
                duration_minutes = random.randint(5, 20)
            else:
                size_gb = 0.0
                duration_minutes = random.randint(1, 5)
            
            # Formatar duração
            duration = f"{duration_minutes:02d}:{random.randint(0, 59):02d}"
            
            backup_data.append({
                "backup_id": f"bkp_{backup_id:06d}",
                "client_id": client["id"],
                "client_name": client["name"],
                "date": backup_time.strftime("%Y-%m-%d %H:%M:%S"),
                "status": status,
                "duration": duration,
                "size": f"{size_gb} GB"
            })
            
            backup_id += 1
            backup_count += 1
            
            # Próximo backup (diário)
            current_date += timedelta(days=1)
    
    return backup_data

def write_clients_csv(data, filename):
    """Escreve arquivo CSV de clientes"""
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['client_id', 'name', 'cnpj', 'email', 'phone', 'address', 'status', 'join_date', 'logo', 'backup_frequency', 'backup_retention_days', 'last_backup_date', 'total_backups', 'successful_backups', 'failed_backups', 'avg_backup_size_gb']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in data:
            writer.writerow(row)

def write_backup_csv(data, filename):
    """Escreve arquivo CSV de backups"""
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['backup_id', 'client_id', 'client_name', 'date', 'status', 'duration', 'size']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in data:
            writer.writerow(row)

if __name__ == "__main__":
    print("Gerando 500 clientes...")
    clients = generate_clients(500)
    
    print("Gerando 400 backups por cliente...")
    backup_data = generate_backup_data(clients, 400)
    
    # Ordenar por data
    backup_data.sort(key=lambda x: x['date'])
    
    # Calcular estatísticas para cada cliente
    print("Calculando estatísticas...")
    client_stats = {}
    for backup in backup_data:
        client_id = backup['client_id']
        if client_id not in client_stats:
            client_stats[client_id] = {
                'total_backups': 0,
                'successful_backups': 0,
                'failed_backups': 0,
                'last_backup_date': backup['date']
            }
        
        client_stats[client_id]['total_backups'] += 1
        if backup['status'] == 'success':
            client_stats[client_id]['successful_backups'] += 1
        else:
            client_stats[client_id]['failed_backups'] += 1
        
        # Atualizar última data de backup
        if backup['date'] > client_stats[client_id]['last_backup_date']:
            client_stats[client_id]['last_backup_date'] = backup['date']
    
    # Preparar dados dos clientes com estatísticas
    print("Preparando dados finais...")
    clients_with_stats = []
    for client in clients:
        stats = client_stats.get(client['id'], {
            'total_backups': 0,
            'successful_backups': 0,
            'failed_backups': 0,
            'last_backup_date': 'N/A'
        })
        
        clients_with_stats.append({
            'client_id': client['id'],
            'name': client['name'],
            'cnpj': client['cnpj'],
            'email': client['email'],
            'phone': client['phone'],
            'address': client['address'],
            'status': client['status'],
            'join_date': '2023-01-15',
            'logo': 'https://api.placeholder.com/40/40',
            'backup_frequency': 'daily',
            'backup_retention_days': 30,
            'last_backup_date': stats['last_backup_date'],
            'total_backups': stats['total_backups'],
            'successful_backups': stats['successful_backups'],
            'failed_backups': stats['failed_backups'],
            'avg_backup_size_gb': client['avg_size']
        })
    
    # Escrever arquivos
    print("Escrevendo arquivos...")
    write_clients_csv(clients_with_stats, 'data/clients.csv')
    write_backup_csv(backup_data, 'data/backup.csv')
    
    print(f"\n✅ Dataset gerado com sucesso!")
    print(f"📊 Clientes: {len(clients_with_stats)}")
    print(f"📊 Backups: {len(backup_data):,}")
    print(f"📊 Média de backups por cliente: {len(backup_data) // len(clients_with_stats)}")
    
    # Estatísticas gerais
    success_count = sum(1 for item in backup_data if item['status'] == 'success')
    failed_count = sum(1 for item in backup_data if item['status'] == 'failed')
    total_count = len(backup_data)
    
    print(f"\n📈 Estatísticas de Backup:")
    print(f"   Sucessos: {success_count:,} ({(success_count/total_count*100):.1f}%)")
    print(f"   Falhas: {failed_count:,} ({(failed_count/total_count*100):.1f}%)")
    
    # Estatísticas por status de cliente
    active_clients = sum(1 for c in clients_with_stats if c['status'] == 'active')
    inactive_clients = sum(1 for c in clients_with_stats if c['status'] == 'inactive')
    pending_clients = sum(1 for c in clients_with_stats if c['status'] == 'pending')
    
    print(f"\n👥 Distribuição de Clientes:")
    print(f"   Ativos: {active_clients} ({(active_clients/len(clients_with_stats)*100):.1f}%)")
    print(f"   Inativos: {inactive_clients} ({(inactive_clients/len(clients_with_stats)*100):.1f}%)")
    print(f"   Pendentes: {pending_clients} ({(pending_clients/len(clients_with_stats)*100):.1f}%)")
    
    print(f"\n🎯 Arquivos atualizados:")
    print(f"   📁 data/clients.csv")
    print(f"   📁 data/backup.csv")
