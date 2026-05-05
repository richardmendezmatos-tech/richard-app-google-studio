import { NextResponse } from 'next/server';
import { CleanAuditLogs } from '@/server/application/use-cases';
import { FirestoreLogRepository } from '@/server/infrastructure/persistence/firestore/FirestoreLogRepository';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.info("Running Log Cleanup...");
  try {
    const logRepository = new FirestoreLogRepository();
    const useCase = new CleanAuditLogs(logRepository);
    const deletedCount = await useCase.execute(30);
    console.info(`Log Cleanup complete. Deleted ${deletedCount} logs.`);
    return NextResponse.json({ success: true, deleted: deletedCount });
  } catch (error: any) {
    console.error("Error in cleanupOldLogs", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
