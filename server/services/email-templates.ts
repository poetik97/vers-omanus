interface EmailTemplateData {
    userName?: string;
    [key: string]: any;
}

const BRAND_COLOR = '#a855f7'; // Purple
const SECONDARY_COLOR = '#ec4899'; // Pink

/**
 * Base HTML template with responsive layout and brand styling
 */
function baseTemplate(content: string, footerText?: string): string {
    return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Organiza-te360</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${SECONDARY_COLOR} 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎯 Organiza-te360
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">
                ${footerText || 'Organiza-te360 - A tua plataforma premium de organização pessoal'}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="{{UNSUBSCRIBE_URL}}" style="color: #9ca3af; text-decoration: underline;">Gerir preferências de notificações</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Creates a CTA button
 */
function ctaButton(text: string, url: string): string {
    return `
    <table role="presentation" style="margin: 30px auto;">
      <tr>
        <td style="border-radius: 8px; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${SECONDARY_COLOR} 100%);">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ===========================================
// TEMPLATE 1: Task Reminder
// ===========================================
export function taskReminderTemplate(data: {
    taskTitle: string;
    taskDescription?: string;
    dueDate: string;
    priority: string;
    taskUrl: string;
    userName?: string;
}): { subject: string; html: string; text: string } {
    const priorityEmoji =
        data.priority === 'high' ? '🔴' :
            data.priority === 'medium' ? '🟡' : '🟢';

    const content = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
      Olá${data.userName ? ` ${data.userName}` : ''},
    </p>
    <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
      ${priorityEmoji} Lembrete de Tarefa
    </h2>
    <div style="background-color: #f3f4f6; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px; font-size: 18px; color: #111827;">
        ${data.taskTitle}
      </h3>
      ${data.taskDescription ? `<p style="margin: 0 0 15px; color: #6b7280;">${data.taskDescription}</p>` : ''}
      <p style="margin: 0; color: #9ca3af; font-size: 14px;">
        📅 Prazo: <strong>${data.dueDate}</strong>
      </p>
    </div>
    ${ctaButton('Ver Tarefa', data.taskUrl)}
    <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
      Completa esta tarefa para ganhar XP e manter o teu streak! 🔥
    </p>
  `;

    return {
        subject: `⏰ Lembrete: ${data.taskTitle}`,
        html: baseTemplate(content),
        text: `Olá${data.userName ? ` ${data.userName}` : ''}! Lembrete de tarefa: "${data.taskTitle}". Prazo: ${data.dueDate}. Ver mais: ${data.taskUrl}`,
    };
}

// ===========================================
// TEMPLATE 2: Event Reminder
// ===========================================
export function eventReminderTemplate(data: {
    eventTitle: string;
    eventDescription?: string;
    startTime: string;
    location?: string;
    eventUrl: string;
    userName?: string;
}): { subject: string; html: string; text: string } {
    const content = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
      Olá${data.userName ? ` ${data.userName}` : ''},
    </p>
    <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
      📅 Evento Próximo
    </h2>
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px; font-size: 18px; color: #111827;">
        ${data.eventTitle}
      </h3>
      ${data.eventDescription ? `<p style="margin: 0 0 15px; color: #6b7280;">${data.eventDescription}</p>` : ''}
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        🕐 <strong>${data.startTime}</strong>
      </p>
      ${data.location ? `<p style="margin: 10px 0 0; color: #6b7280; font-size: 14px;">📍 ${data.location}</p>` : ''}
    </div>
    ${ctaButton('Ver Calendário', data.eventUrl)}
  `;

    return {
        subject: `🔔 Evento em breve: ${data.eventTitle}`,
        html: baseTemplate(content),
        text: `Olá${data.userName ? ` ${data.userName}` : ''}! Lembrete de evento: "${data.eventTitle}" às ${data.startTime}. Ver mais: ${data.eventUrl}`,
    };
}

// ===========================================
// TEMPLATE 3: Daily Summary
// ===========================================
export function dailySummaryTemplate(data: {
    date: string;
    tasksCount: number;
    eventsCount: number;
    completedTasksCount: number;
    goalsProgress?: number;
    userName?: string;
    dashboardUrl: string;
}): { subject: string; html: string; text: string } {
    const content = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
      Bom dia${data.userName ? `, ${data.userName}` : ''}! ☀️
    </p>
    <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
      📊 Resumo de ${data.date}
    </h2>
    
    <table role="presentation" style="width: 100%; margin: 20px 0;">
      <tr>
        <td style="padding: 15px; background-color: #fef3c7; border-radius: 8px; width: 50%;">
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #92400e; text-align: center;">
            ${data.tasksCount}
          </p>
          <p style="margin: 5px 0 0; color: #92400e; font-size: 14px; text-align: center;">
            Tarefas para hoje
          </p>
        </td>
        <td style="width: 20px;"></td>
        <td style="padding: 15px; background-color: #dbeafe; border-radius: 8px; width: 50%;">
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #1e40af; text-align: center;">
            ${data.eventsCount}
          </p>
          <p style="margin: 5px 0 0; color: #1e40af; font-size: 14px; text-align: center;">
            Eventos agendados
          </p>
        </td>
      </tr>
    </table>
    
    ${data.completedTasksCount > 0 ? `
    <div style="background-color: #d1fae5; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #065f46; font-size: 16px;">
        ✅ <strong>${data.completedTasksCount}</strong> tarefas completadas ontem!
      </p>
    </div>
    ` : ''}
    
    ${ctaButton('Ver Dashboard', data.dashboardUrl)}
    
    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
      Tem um dia produtivo! 💪
    </p>
  `;

    return {
        subject: `📅 Resumo Diário - ${data.date}`,
        html: baseTemplate(content),
        text: `Resumo de ${data.date}: ${data.tasksCount} tarefas, ${data.eventsCount} eventos. Ver mais: ${data.dashboardUrl}`,
    };
}

// ===========================================
// TEMPLATE 4: Goal Achievement
// ===========================================
export function goalAchievementTemplate(data: {
    goalTitle: string;
    progress: number;
    milestone?: string;
    goalUrl: string;
    userName?: string;
}): { subject: string; html: string; text: string } {
    const isComplete = data.progress >= 100;
    const emoji = isComplete ? '🎉' : data.progress >= 75 ? '🔥' : data.progress >= 50 ? '💪' : '📈';

    const content = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
      Olá${data.userName ? ` ${data.userName}` : ''},
    </p>
    <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
      ${emoji} ${isComplete ? 'Objetivo Concluído!' : 'Progresso de Objetivo'}
    </h2>
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 15px; font-size: 18px; color: #111827;">
        ${data.goalTitle}
      </h3>
      <div style="background-color: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden; margin: 15px 0;">
        <div style="background: linear-gradient(90deg, ${BRAND_COLOR} 0%, ${SECONDARY_COLOR} 100%); height: 100%; width: ${Math.min(data.progress, 100)}%; border-radius: 6px; transition: width 0.3s;"></div>
      </div>
      <p style="margin: 10px 0 0; color: #6b7280; font-size: 16px; font-weight: 600; text-align: center;">
        ${Math.round(data.progress)}% completo
      </p>
      ${data.milestone ? `<p style="margin: 15px 0 0; color: #10b981; font-size: 14px; text-align: center;">${data.milestone}</p>` : ''}
    </div>
    ${ctaButton(isComplete ? 'Ver Conquista' : 'Continuar', data.goalUrl)}
    ${isComplete ? `
    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
      Parabéns! Ganhas-te XP bônus! 🎁
    </p>
    ` : ''}
  `;

    return {
        subject: isComplete ? `🎉 Parabéns! Objetivo "${data.goalTitle}" concluído!` : `${emoji} Progresso: ${data.goalTitle}`,
        html: baseTemplate(content),
        text: `${isComplete ? 'Parabéns!' : 'Progresso'}: "${data.goalTitle}" - ${Math.round(data.progress)}% completo. Ver mais: ${data.goalUrl}`,
    };
}

// ===========================================
// TEMPLATE 5: Budget Alert
// ===========================================
export function budgetAlertTemplate(data: {
    category: string;
    spent: number;
    budget: number;
    percentage: number;
    financeUrl: string;
    userName?: string;
}): { subject: string; html: string; text: string } {
    const isOverBudget = data.percentage > 100;
    const warningLevel = isOverBudget ? 'danger' : data.percentage >= 90 ? 'warning' : 'info';
    const color = warningLevel === 'danger' ? '#dc2626' : warningLevel === 'warning' ? '#f59e0b' : '#3b82f6';

    const content = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
      Olá${data.userName ? ` ${data.userName}` : ''},
    </p>
    <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
      ${isOverBudget ? '⚠️' : '💰'} Alerta de Orçamento
    </h2>
    <div style="background-color: ${isOverBudget ? '#fee2e2' : '#fef3c7'}; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 15px; font-size: 18px; color: #111827;">
        Categoria: ${data.category}
      </h3>
      <p style="margin: 0; color: #6b7280; font-size: 16px;">
        Gasto: <strong style="color: ${color};">€${data.spent.toFixed(2)}</strong> de €${data.budget.toFixed(2)}
      </p>
      <div style="background-color: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden; margin: 15px 0;">
        <div style="background-color: ${color}; height: 100%; width: ${Math.min(data.percentage, 100)}%; border-radius: 6px;"></div>
      </div>
      <p style="margin: 0; color: ${color}; font-size: 16px; font-weight: 600; text-align: center;">
        ${Math.round(data.percentage)}% do orçamento ${isOverBudget ? 'excedido' : 'usado'}
      </p>
    </div>
    ${ctaButton('Ver Finanças', data.financeUrl)}
    ${isOverBudget ? `
    <p style="margin: 20px 0 0; color: #dc2626; font-size: 14px; text-align: center; font-weight: 600;">
      ⚠️ Atenção aos teus gastos este mês!
    </p>
    ` : ''}
  `;

    return {
        subject: `💰 ${isOverBudget ? 'Orçamento Excedido' : 'Alerta de Orçamento'}: ${data.category}`,
        html: baseTemplate(content),
        text: `Alerta de orçamento: ${data.category} - €${data.spent.toFixed(2)} de €${data.budget.toFixed(2)} (${Math.round(data.percentage)}%). Ver mais: ${data.financeUrl}`,
    };
}

// ===========================================
// TEMPLATE 6: Weekly Summary
// ===========================================
export function weeklySummaryTemplate(data: {
    weekNumber: number;
    tasksCompleted: number;
    eventsAttended: number;
    xpEarned: number;
    streakDays: number;
    topGoal?: string;
    dashboardUrl: string;
    userName?: string;
}): { subject: string; html: string; text: string } {
    const content = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
      Olá${data.userName ? ` ${data.userName}` : ''},
    </p>
    <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
      📊 Resumo Semanal - Semana ${data.weekNumber}
    </h2>
    
    <div style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${SECONDARY_COLOR} 100%); border-radius: 12px; padding: 25px; margin: 20px 0; color: #ffffff; text-align: center;">
      <p style="margin: 0 0 10px; font-size: 48px; font-weight: 700;">
        ${data.tasksCompleted}
      </p>
      <p style="margin: 0; font-size: 18px; opacity: 0.9;">
        Tarefas Completadas 🎯
      </p>
    </div>
    
    <table role="presentation" style="width: 100%; margin: 20px 0;">
      <tr>
        <td style="padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
            ${data.xpEarned}
          </p>
          <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">
            XP Ganho ⭐
          </p>
        </td>
        <td style="width: 15px;"></td>
        <td style="padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
            ${data.streakDays}
          </p>
          <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">
            Dias de Streak 🔥
          </p>
        </td>
        <td style="width: 15px;"></td>
        <td style="padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
            ${data.eventsAttended}
          </p>
          <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">
            Eventos 📅
          </p>
        </td>
      </tr>
    </table>
    
    ${data.topGoal ? `
    <div style="background-color: #ecfdf5; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #065f46; font-size: 14px;">
        🎯 Objetivo destaque: <strong>${data.topGoal}</strong>
      </p>
    </div>
    ` : ''}
    
    ${ctaButton('Ver Relatório Completo', data.dashboardUrl)}
    
    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
      Continue assim! 💪 Próxima semana vai ser ainda melhor!
    </p>
  `;

    return {
        subject: `🎯 Resumo Semanal - Semana ${data.weekNumber}`,
        html: baseTemplate(content),
        text: `Resumo da Semana ${data.weekNumber}: ${data.tasksCompleted} tarefas completadas, ${data.xpEarned} XP ganho, ${data.streakDays} dias de streak. Ver mais: ${data.dashboardUrl}`,
    };
}

// ===========================================
// TEMPLATE 7: Diary Reminder
// ===========================================
export function diaryReminderTemplate(data: {
    lastEntryDate?: string;
    diaryUrl: string;
    userName?: string;
}): { subject: string; html: string; text: string } {
    const content = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
      Olá${data.userName ? ` ${data.userName}` : ''},
    </p>
    <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
      📖 Hora de Escrever no Diário
    </h2>
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0; color: #78350f; font-size: 16px;">
        Reserva alguns minutos para refletir sobre o teu dia. Escrever no diário ajuda a organizar pensamentos e reduzir stress.
      </p>
      ${data.lastEntryDate ? `
      <p style="margin: 15px 0 0; color: #92400e; font-size: 14px;">
        Última entrada: ${data.lastEntryDate}
      </p>
      ` : ''}
    </div>
    ${ctaButton('Escrever Agora', data.diaryUrl)}
    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
      💡 Dica: Escrever antes de dormir ajuda a ter um sono mais tranquilo
    </p>
  `;

    return {
        subject: '📖 Lembrete: Escrever no Diário',
        html: baseTemplate(content),
        text: `Olá${data.userName ? ` ${data.userName}` : ''}! Hora de escrever no teu diário. ${data.lastEntryDate ? `Última entrada: ${data.lastEntryDate}.` : ''} Escrever: ${data.diaryUrl}`,
    };
}

// ===========================================
// TEMPLATE 8: Menstrual Cycle Alert
// ===========================================
export function menstrualCycleAlertTemplate(data: {
    phase: 'próximo ciclo' | 'ovulação' | 'fase fértil';
    daysUntil: number;
    cycleUrl: string;
    userName?: string;
}): { subject: string; html: string; text: string } {
    const phaseEmoji = data.phase === 'ovulação' ? '🌸' : data.phase === 'fase fértil' ? '🌺' : '🔄';

    const content = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
      Olá${data.userName ? ` ${data.userName}` : ''},
    </p>
    <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
      ${phaseEmoji} Alerta de Ciclo Menstrual
    </h2>
    <div style="background-color: #fce7f3; border-left: 4px solid ${SECONDARY_COLOR}; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0; color: #831843; font-size: 18px; font-weight: 600;">
        Previsão: ${data.phase}
      </p>
      <p style="margin: 15px 0 0; color: #9f1239; font-size: 16px;">
        Em aproximadamente ${data.daysUntil} dia${data.daysUntil !== 1 ? 's' : ''}
      </p>
    </div>
    ${ctaButton('Ver Calendário', data.cycleUrl)}
    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
      💡 Prepara-te com antecedência
    </p>
  `;

    return {
        subject: `${phaseEmoji} Previsão: ${data.phase} em ${data.daysUntil} dias`,
        html: baseTemplate(content),
        text: `Olá${data.userName ? ` ${data.userName}` : ''}! Previsão de ${data.phase} em ${data.daysUntil} dia${data.daysUntil !== 1 ? 's' : ''}. Ver mais: ${data.cycleUrl}`,
    };
}
