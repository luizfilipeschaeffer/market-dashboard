import csv
import random
from datetime import datetime, timedelta
import os

# Lista expandida de clientes com dados realistas
clients_data = [
    # Clientes existentes (mantendo os IDs originais)
    {"id": "clt_001", "name": "Soluções Empresariais Ltda", "cnpj": "12.345.678/0001-90", "email": "contato@solucoesempresariais.com.br", "phone": "(11) 3456-7890", "address": "São Paulo - SP", "status": "active", "avg_size": 1.85, "success_rate": 0.87},
    {"id": "clt_002", "name": "Tech Solutions Ltda", "cnpj": "23.456.789/0001-12", "email": "admin@techsolutions.com.br", "phone": "(11) 2345-6789", "address": "São Paulo - SP", "status": "active", "avg_size": 2.32, "success_rate": 0.93},
    {"id": "clt_003", "name": "Inovação Digital S.A.", "cnpj": "34.567.890/0001-23", "email": "suporte@inovacaodigital.com.br", "phone": "(21) 3456-7890", "address": "Rio de Janeiro - RJ", "status": "active", "avg_size": 0.80, "success_rate": 0.67},
    {"id": "clt_004", "name": "Sistemas Integrados ME", "cnpj": "45.678.901/0001-34", "email": "info@sistemasintegrados.com.br", "phone": "(31) 4567-8901", "address": "Belo Horizonte - MG", "status": "active", "avg_size": 3.15, "success_rate": 0.83},
    {"id": "clt_005", "name": "DataGuard Brasil", "cnpj": "56.789.012/0001-45", "email": "contato@dataguard.com.br", "phone": "(41) 5678-9012", "address": "Curitiba - PR", "status": "inactive", "avg_size": 1.55, "success_rate": 0.43},
    {"id": "clt_006", "name": "Cloud Masters LTDA", "cnpj": "67.890.123/0001-56", "email": "suporte@cloudmasters.com.br", "phone": "(51) 6789-0123", "address": "Porto Alegre - RS", "status": "active", "avg_size": 4.25, "success_rate": 0.80},
    {"id": "clt_007", "name": "Alpha Data Center", "cnpj": "78.901.234/0001-67", "email": "admin@alphadatacenter.com.br", "phone": "(61) 7890-1234", "address": "Brasília - DF", "status": "pending", "avg_size": 0.50, "success_rate": 0.60},
    {"id": "clt_008", "name": "Beta Solutions", "cnpj": "89.012.345/0001-78", "email": "info@betasolutions.com.br", "phone": "(71) 8901-2345", "address": "Salvador - BA", "status": "active", "avg_size": 2.85, "success_rate": 0.90},
    
    # Novos clientes
    {"id": "clt_009", "name": "Digital Systems Corp", "cnpj": "90.123.456/0001-89", "email": "contato@digitalsystems.com.br", "phone": "(11) 9876-5432", "address": "São Paulo - SP", "status": "active", "avg_size": 2.10, "success_rate": 0.88},
    {"id": "clt_010", "name": "TechCorp Brasil", "cnpj": "01.234.567/0001-90", "email": "admin@techcorp.com.br", "phone": "(21) 8765-4321", "address": "Rio de Janeiro - RJ", "status": "active", "avg_size": 1.75, "success_rate": 0.92},
    {"id": "clt_011", "name": "Inovação Tech Ltda", "cnpj": "12.345.678/0002-01", "email": "suporte@inovacaotech.com.br", "phone": "(31) 7654-3210", "address": "Belo Horizonte - MG", "status": "active", "avg_size": 1.45, "success_rate": 0.85},
    {"id": "clt_012", "name": "DataFlow Solutions", "cnpj": "23.456.789/0002-12", "email": "info@dataflow.com.br", "phone": "(41) 6543-2109", "address": "Curitiba - PR", "status": "active", "avg_size": 3.20, "success_rate": 0.78},
    {"id": "clt_013", "name": "CloudTech Brasil", "cnpj": "34.567.890/0002-23", "email": "contato@cloudtech.com.br", "phone": "(51) 5432-1098", "address": "Porto Alegre - RS", "status": "active", "avg_size": 2.80, "success_rate": 0.89},
    {"id": "clt_014", "name": "SecureData Ltda", "cnpj": "45.678.901/0002-34", "email": "admin@securedata.com.br", "phone": "(61) 4321-0987", "address": "Brasília - DF", "status": "active", "avg_size": 1.90, "success_rate": 0.91},
    {"id": "clt_015", "name": "InfoSystems S.A.", "cnpj": "56.789.012/0002-45", "email": "suporte@infosystems.com.br", "phone": "(71) 3210-9876", "address": "Salvador - BA", "status": "active", "avg_size": 2.50, "success_rate": 0.86},
    {"id": "clt_016", "name": "TechBridge Corp", "cnpj": "67.890.123/0002-56", "email": "info@techbridge.com.br", "phone": "(11) 2109-8765", "address": "São Paulo - SP", "status": "active", "avg_size": 1.65, "success_rate": 0.84},
    {"id": "clt_017", "name": "DataVault Brasil", "cnpj": "78.901.234/0002-67", "email": "contato@datavault.com.br", "phone": "(21) 1098-7654", "address": "Rio de Janeiro - RJ", "status": "inactive", "avg_size": 2.15, "success_rate": 0.45},
    {"id": "clt_018", "name": "CloudFirst Ltda", "cnpj": "89.012.345/0002-78", "email": "admin@cloudfirst.com.br", "phone": "(31) 0987-6543", "address": "Belo Horizonte - MG", "status": "active", "avg_size": 3.50, "success_rate": 0.87},
    {"id": "clt_019", "name": "TechNova Solutions", "cnpj": "90.123.456/0002-89", "email": "suporte@technova.com.br", "phone": "(41) 9876-5432", "address": "Curitiba - PR", "status": "pending", "avg_size": 1.25, "success_rate": 0.55},
    {"id": "clt_020", "name": "DataCore Systems", "cnpj": "01.234.567/0003-00", "email": "info@datacore.com.br", "phone": "(51) 8765-4321", "address": "Porto Alegre - RS", "status": "active", "avg_size": 2.75, "success_rate": 0.93},
    {"id": "clt_021", "name": "Inovação Data", "cnpj": "12.345.678/0003-11", "email": "contato@inovacaodata.com.br", "phone": "(61) 7654-3210", "address": "Brasília - DF", "status": "active", "avg_size": 1.80, "success_rate": 0.88},
    {"id": "clt_022", "name": "TechFlow Corp", "cnpj": "23.456.789/0003-22", "email": "admin@techflow.com.br", "phone": "(71) 6543-2109", "address": "Salvador - BA", "status": "active", "avg_size": 2.30, "success_rate": 0.90},
    {"id": "clt_023", "name": "CloudSecure Ltda", "cnpj": "34.567.890/0003-33", "email": "suporte@cloudsecure.com.br", "phone": "(11) 5432-1098", "address": "São Paulo - SP", "status": "active", "avg_size": 1.95, "success_rate": 0.89},
    {"id": "clt_024", "name": "DataTech Brasil", "cnpj": "45.678.901/0003-44", "email": "info@datatech.com.br", "phone": "(21) 4321-0987", "address": "Rio de Janeiro - RJ", "status": "active", "avg_size": 2.60, "success_rate": 0.85},
    {"id": "clt_025", "name": "TechInnovate S.A.", "cnpj": "56.789.012/0003-55", "email": "contato@techinnovate.com.br", "phone": "(31) 3210-9876", "address": "Belo Horizonte - MG", "status": "inactive", "avg_size": 1.40, "success_rate": 0.40},
    {"id": "clt_026", "name": "CloudBridge Solutions", "cnpj": "67.890.123/0003-66", "email": "admin@cloudbridge.com.br", "phone": "(41) 2109-8765", "address": "Curitiba - PR", "status": "active", "avg_size": 3.10, "success_rate": 0.82},
    {"id": "clt_027", "name": "DataStream Corp", "cnpj": "78.901.234/0003-77", "email": "suporte@datastream.com.br", "phone": "(51) 1098-7654", "address": "Porto Alegre - RS", "status": "active", "avg_size": 2.40, "success_rate": 0.91},
    {"id": "clt_028", "name": "TechVault Ltda", "cnpj": "89.012.345/0003-88", "email": "info@techvault.com.br", "phone": "(61) 0987-6543", "address": "Brasília - DF", "status": "pending", "avg_size": 1.70, "success_rate": 0.50},
    {"id": "clt_029", "name": "CloudData Systems", "cnpj": "90.123.456/0003-99", "email": "contato@clouddata.com.br", "phone": "(71) 9876-5432", "address": "Salvador - BA", "status": "active", "avg_size": 2.85, "success_rate": 0.87},
    {"id": "clt_030", "name": "DataInnovate Brasil", "cnpj": "01.234.567/0004-10", "email": "admin@datainnovate.com.br", "phone": "(11) 8765-4321", "address": "São Paulo - SP", "status": "active", "avg_size": 1.55, "success_rate": 0.94}
]

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

def generate_backup_data():
    backup_data = []
    backup_id = 1
    
    # Data de início (6 meses atrás)
    start_date = datetime(2023, 7, 1)
    end_date = datetime(2024, 1, 8)
    
    for client in clients_data:
        current_date = start_date
        
        # Cliente inativo para de fazer backup em outubro
        if client["status"] == "inactive":
            end_date_client = datetime(2023, 10, 31)
        else:
            end_date_client = end_date
        
        while current_date <= end_date_client:
            # Pular fins de semana para alguns clientes
            if client["id"] in ["clt_003", "clt_007", "clt_019", "clt_028"] and current_date.weekday() >= 5:
                current_date += timedelta(days=1)
                continue
            
            # Gerar horário de backup baseado no cliente
            if client["id"] in ["clt_001", "clt_002", "clt_004", "clt_006", "clt_008", "clt_009", "clt_010", "clt_011", "clt_012", "clt_013", "clt_014", "clt_015", "clt_016", "clt_018", "clt_020", "clt_021", "clt_022", "clt_023", "clt_024", "clt_026", "clt_027", "clt_029", "clt_030"]:
                # Backup noturno
                hour = random.randint(23, 23)
                minute = random.randint(0, 59)
            elif client["id"] in ["clt_003", "clt_007", "clt_019", "clt_028"]:
                # Backup madrugada
                hour = random.randint(1, 3)
                minute = random.randint(0, 59)
            else:  # clientes inativos
                # Backup tarde
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
                duration_minutes = random.randint(5, 15)
            else:
                size_gb = 0.0
                duration_minutes = random.randint(1, 5)
            
            # Formatar duração
            duration = f"{duration_minutes:02d}:{random.randint(0, 59):02d}"
            
            backup_data.append({
                "backup_id": f"bkp_{backup_id:04d}",
                "client_id": client["id"],
                "client_name": client["name"],
                "date": backup_time.strftime("%Y-%m-%d %H:%M:%S"),
                "status": status,
                "duration": duration,
                "size": f"{size_gb} GB"
            })
            
            backup_id += 1
            
            # Próximo backup baseado na frequência
            if client["status"] == "inactive":
                # Backup semanal
                current_date += timedelta(days=7)
            else:
                # Backup diário
                current_date += timedelta(days=1)
    
    return backup_data

def write_clients_csv(data, filename):
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['client_id', 'name', 'cnpj', 'email', 'phone', 'address', 'status', 'join_date', 'logo', 'backup_frequency', 'backup_retention_days', 'last_backup_date', 'total_backups', 'successful_backups', 'failed_backups', 'avg_backup_size_gb']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in data:
            writer.writerow(row)

def write_backup_csv(data, filename):
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['backup_id', 'client_id', 'client_name', 'date', 'status', 'duration', 'size']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in data:
            writer.writerow(row)

if __name__ == "__main__":
    # Gerar dados de backup
    backup_data = generate_backup_data()
    
    # Ordenar por data
    backup_data.sort(key=lambda x: x['date'])
    
    # Calcular estatísticas para cada cliente
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
    
    # Preparar dados dos clientes
    clients_with_stats = []
    for client in clients_data:
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
            'join_date': '2023-01-15',  # Data fixa para simplicidade
            'logo': 'https://api.placeholder.com/40/40',
            'backup_frequency': 'daily' if client['status'] != 'inactive' else 'weekly',
            'backup_retention_days': 30,
            'last_backup_date': stats['last_backup_date'],
            'total_backups': stats['total_backups'],
            'successful_backups': stats['successful_backups'],
            'failed_backups': stats['failed_backups'],
            'avg_backup_size_gb': client['avg_size']
        })
    
    # Escrever arquivos
    write_clients_csv(clients_with_stats, 'data/clients.csv')
    write_backup_csv(backup_data, 'data/backup.csv')
    
    print(f"Gerados {len(backup_data)} registros de backup para {len(clients_with_stats)} clientes")
    print("Arquivos data/clients.csv e data/backup.csv atualizados!")
    
    # Estatísticas
    success_count = sum(1 for item in backup_data if item['status'] == 'success')
    failed_count = sum(1 for item in backup_data if item['status'] == 'failed')
    total_count = len(backup_data)
    
    print(f"\nEstatísticas:")
    print(f"Total de backups: {total_count}")
    print(f"Sucessos: {success_count} ({(success_count/total_count*100):.1f}%)")
    print(f"Falhas: {failed_count} ({(failed_count/total_count*100):.1f}%)")
    
    # Estatísticas por status de cliente
    active_clients = sum(1 for c in clients_with_stats if c['status'] == 'active')
    inactive_clients = sum(1 for c in clients_with_stats if c['status'] == 'inactive')
    pending_clients = sum(1 for c in clients_with_stats if c['status'] == 'pending')
    
    print(f"\nClientes:")
    print(f"Ativos: {active_clients}")
    print(f"Inativos: {inactive_clients}")
    print(f"Pendentes: {pending_clients}")
