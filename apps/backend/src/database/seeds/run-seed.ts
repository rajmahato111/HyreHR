import { AppDataSource } from '../data-source';
import { runInitialSeed } from './initial-seed';

async function runSeeds() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    await runInitialSeed(AppDataSource);

    console.log('\n✅ All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();
