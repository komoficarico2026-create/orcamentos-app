export function sanitizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppLink({
  phone,
  clientName,
  companyName,
  context = "rascunho",
}: {
  phone: string;
  clientName?: string | null;
  companyName?: string | null;
  context?: "rascunho" | "enviado" | "aprovado" | "recusado" | string;
}) {
  const sanitized = sanitizePhone(phone);

  if (!sanitized) return null;

  const greeting = `Olá${clientName ? ` ${clientName}` : ""},`;
  const signature = companyName || "Nome da Empresa";

  let messageLines: string[] = [];

  switch (context) {
    case "rascunho":
      messageLines = [
        greeting,
        "Passando para avisar que acabei de gerar o seu orçamento.",
        "Assim que possível, te encaminho o PDF completo para análise.",
        "",
        "Fico à disposição!",
        signature,
      ];
      break;
    case "enviado":
      messageLines = [
        greeting,
        "Segue o PDF com o nosso orçamento detalhado.",
        "Se conseguiu dar uma olhada e tiver qualquer dúvida, é só me chamar por aqui.",
        "",
        "Aguardo seu retorno,",
        signature,
      ];
      break;
    case "aprovado":
      messageLines = [
        greeting,
        "Muito obrigado por aprovar nosso orçamento e pela confiança em nosso trabalho!",
        "Vamos alinhar os próximos passos para darmos início?",
        "",
        "Abraços,",
        signature,
      ];
      break;
    case "mudancas":
      messageLines = [
        greeting,
        "Recebi suas observações sobre o orçamento.",
        "Já estou revisando os detalhes para deixar tudo do seu jeito!",
        "",
        "Em breve te mando a versão atualizada.",
        signature,
      ];
      break;
    case "execucao":
      messageLines = [
        greeting,
        "Passando para te dar um feedback: seu projeto já está em andamento (em fase de execução)!",
        "Qualquer novidade importante, te aviso por aqui.",
        "",
        "Seguimos focados,",
        signature,
      ];
      break;
    case "concluido":
      messageLines = [
        greeting,
        "Boas notícias! Finalizamos o seu pedido/serviço com sucesso.",
        "Espero que tenha gostado do resultado final!",
        "",
        "Se precisar de mais alguma coisa, é só chamar.",
        signature,
      ];
      break;
    case "recusado":
      messageLines = [
        greeting,
        "Agradeço pela atenção dada à nossa proposta.",
        "Caso o cenário mude no futuro ou precise de outro atendimento, sigo à disposição.",
        "",
        "Atenciosamente,",
        signature,
      ];
      break;
    default:
      messageLines = [
        greeting,
        "Aqui está o seu orçamento.",
        "Qualquer dúvida, estou à disposição.",
        "",
        "Agradeço a preferência.",
        signature,
      ];
      break;
  }

  const text = encodeURIComponent(messageLines.join("\n"));

  return `https://wa.me/${sanitized}?text=${text}`;
}