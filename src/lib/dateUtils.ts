// Utilitários para formatação de datas

/**
 * Formata uma string de data para o padrão brasileiro
 * @param dateString - String da data no formato ISO ou outro formato válido
 * @returns String formatada no padrão brasileiro (DD/MM/AAAA HH:mm:ss)
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') {
    return 'N/A'
  }
  
  try {
    const date = new Date(dateString)
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    // Formatar para o padrão brasileiro
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
  } catch (error) {
    console.warn('Erro ao formatar data:', dateString, error)
    return 'Data inválida'
  }
}

/**
 * Formata uma string de data para exibir apenas a data (sem horário)
 * @param dateString - String da data no formato ISO ou outro formato válido
 * @returns String formatada no padrão brasileiro (DD/MM/AAAA)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') {
    return 'N/A'
  }
  
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    })
  } catch (error) {
    console.warn('Erro ao formatar data:', dateString, error)
    return 'Data inválida'
  }
}

/**
 * Formata uma string de data para exibir apenas o horário
 * @param dateString - String da data no formato ISO ou outro formato válido
 * @returns String formatada no padrão brasileiro (HH:mm:ss)
 */
export const formatTime = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') {
    return 'N/A'
  }
  
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
  } catch (error) {
    console.warn('Erro ao formatar horário:', dateString, error)
    return 'Data inválida'
  }
}

/**
 * Formata uma string de data para exibir o dia da semana
 * @param dateString - String da data no formato ISO ou outro formato válido
 * @returns String com o dia da semana em português
 */
export const formatWeekday = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') {
    return 'N/A'
  }
  
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      timeZone: 'America/Sao_Paulo'
    })
  } catch (error) {
    console.warn('Erro ao formatar dia da semana:', dateString, error)
    return 'Data inválida'
  }
}

/**
 * Formata uma string de data para exibir data relativa (ex: "há 2 dias")
 * @param dateString - String da data no formato ISO ou outro formato válido
 * @returns String com a data relativa em português
 */
export const formatRelativeDate = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') {
    return 'N/A'
  }
  
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInDays > 0) {
      return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
    } else if (diffInHours > 0) {
      return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    } else if (diffInMinutes > 0) {
      return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
    } else {
      return 'agora'
    }
  } catch (error) {
    console.warn('Erro ao formatar data relativa:', dateString, error)
    return 'Data inválida'
  }
}
