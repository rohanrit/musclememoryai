import IDEShell from '@/components/IDEShell';
import { buildFileTree } from '@/lib/build-file-tree';
import path from 'path';

const projectDir = path.resolve(process.cwd());

export default function Home() {
  const fileTree = buildFileTree(projectDir);

  return <IDEShell initialFileTree={fileTree} />;
}
