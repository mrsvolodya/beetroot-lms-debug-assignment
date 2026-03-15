// import { sendErrorMessage } from '<notification-service>';

console.log('[Logger] Audit logging initialized successfully');

export async function insertLog(data, ctx) {
  console.log('LOGGGER ===> ');

  // removed stray `return` it made everything below dead code

  const usrLogInfo = await getUser(ctx);

  if (!usrLogInfo) {
    return;
  }

  const { id } = usrLogInfo;

  const {
    message,
    logType = 'ERROR',
    logAction = 'UPDATE',
    toUserId,
    groupId,
    courseId,
  } = data;

  try {
    ctx.db.request(/* ... mutation to create log record ... */);
  } catch (error) {
    console.log('LOG ERROR');
    console.log(error);
  }

  console.log('LOGGGER <=== ');
}

export function insertErrorLog({
  logAction = 'UPDATE',
  error,
  ctx,
  title = '',
  meta = {},
}) {
  console.log(error);
  const options = {
    logType: 'ERROR',
    logAction,
    message: `${title} -> ${
      Array.isArray(error)
        ? error.map((e) => e.message).toString()
        : error.message
    }`,
  };

  if (process.env.STAGE === 'PROD') {
    const message = `ERROR -> \`${title}\` -> \`${logAction}\` \n\`\`\`${options.message}\`\`\``;
    sendErrorMessage(message);
  }

  insertLog(options, ctx);
}