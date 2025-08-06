import cron from 'node-cron';
import { db } from '@/libs/DB';
import { and, gte, lte, isNull, asc } from 'drizzle-orm';
import {
  anamneseItemsTable,
  anamneseTable,
  colaboradorTable,
  clientsTable,
  examesTable,
  employmentTable,
} from '@/models/Schema';
import dayjs from 'dayjs';

// Placeholder para a função de envio de e-mail
const sendEmail = async (to: string, subject: string, body: string) => {
  console.log('\n--------------------------------------------------');
  console.log(`Simulando envio de e-mail para: ${to}`);
  console.log(`Assunto: ${subject}`);
  console.log('------------------ CORPO DO E-MAIL ------------------');
  console.log(body);
  console.log('--------------------------------------------------\n');
  return Promise.resolve();
};

const getExpiringExamsForMonth = async () => {
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  console.log(`Buscando exames com vencimento entre ${startOfMonth.toLocaleDateString()} e ${endOfMonth.toLocaleDateString()}`);

  const expiringExams = await db
    .select({
      clienteId: clientsTable.id,
      clienteNome: clientsTable.fantasia,
      clienteEmail: clientsTable.email,
      colaboradorNome: colaboradorTable.name,
      exameNome: examesTable.descricao,
      vencimento: anamneseItemsTable.vencto,
    })
    .from(anamneseItemsTable)
    .innerJoin(anamneseTable, and(eq(anamneseItemsTable.anamneseId, anamneseTable.id)))
    .innerJoin(colaboradorTable, eq(anamneseTable.colaboradorId, colaboradorTable.id))
    .innerJoin(clientsTable, eq(anamneseTable.clienteId, clientsTable.id))
    .innerJoin(examesTable, eq(anamneseItemsTable.exameId, examesTable.id))
    .innerJoin(
      employmentTable,
      and(
        eq(employmentTable.colaboradorId, colaboradorTable.id),
        eq(employmentTable.clientId, clientsTable.id),
        isNull(employmentTable.dataDemissao),
      ),
    )
    .where(and(gte(anamneseItemsTable.vencto, startOfMonth), lte(anamneseItemsTable.vencto, endOfMonth)))
    .orderBy(asc(colaboradorTable.name), asc(examesTable.descricao));

  return expiringExams;
};

const groupExamsByClient = (exams: Awaited<ReturnType<typeof getExpiringExamsForMonth>>) => {
  const grouped = exams.reduce((acc, exam) => {
    if (!acc[exam.clienteId]) {
      acc[exam.clienteId] = {
        dadosCliente: {
          nome: exam.clienteNome,
          email: exam.clienteEmail,
        },
        funcionarios: {},
      };
    }

    if (!acc[exam.clienteId].funcionarios[exam.colaboradorNome]) {
      acc[exam.clienteId].funcionarios[exam.colaboradorNome] = [];
    }

    acc[exam.clienteId].funcionarios[exam.colaboradorNome].push({
      exame: exam.exameNome,
      vencto: dayjs(exam.vencimento).format('DD/MM/YYYY'),
    });

    return acc;
  }, {} as Record<number, { dadosCliente: { nome: string; email: string }, funcionarios: Record<string, { exame: string; vencto: string }[]> }>);

  return grouped;
};

const generateEmailBody = (clientName: string, funcionarios: Record<string, { exame: string; vencto: string }[]>) => {
  let body = `Prezados responsáveis da empresa ${clientName},\n\n`;
  body += 'Segue abaixo a lista de exames ocupacionais que vencerão este mês:\n\n';

  for (const funcionario in funcionarios) {
    body += `Funcionário: ${funcionario}\n`;
    for (const exame of funcionarios[funcionario]) {
      body += `  - Exame: ${exame.exame}, Vencimento: ${exame.vencto}\n`;
    }
    body += '\n';
  }

  body += 'Por favor, entrem em contato para agendar a renovação dos exames.\n\nAtenciosamente,\nSua Clínica';

  return body;
};


export const sendMonthlyExpiryReport = async () => {
  console.log('Iniciando job: Envio de Relatório Mensal de Vencimentos...');
  try {
    const exams = await getExpiringExamsForMonth();
    if (exams.length === 0) {
      console.log('Nenhum exame vencendo este mês. Job concluído.');
      return;
    }

    const clientsData = groupExamsByClient(exams);

    for (const clientId in clientsData) {
      const client = clientsData[clientId];
      const subject = `Relatório de Vencimento de Exames - ${dayjs().format('MMMM/YYYY')}`;
      const body = generateEmailBody(client.dadosCliente.nome, client.funcionarios);
      
      // Por enquanto, apenas logamos. Futuramente, enviaremos o e-mail.
      await sendEmail(client.dadosCliente.email, subject, body);
    }

    console.log(`Relatórios gerados para ${Object.keys(clientsData).length} cliente(s). Job concluído.`);
  } catch (error) {
    console.error('Erro ao executar o job de envio de relatório mensal:', error);
  }
};

// Agenda a tarefa para rodar às 7h da manhã do dia 1 de cada mês.
// Para testar, você pode mudar para, por exemplo, '*/10 * * * * *' para rodar a cada 10 segundos.
cron.schedule('0 7 1 * *', sendMonthlyExpiryReport, {
  scheduled: true,
  timezone: "America/Sao_Paulo",
});

console.log('Job de notificação de exames a vencer agendado para 07:00 do dia 1 de cada mês.');
