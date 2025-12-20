import { Metadata } from 'next';
import SkillList from '@/components/skills/SkillList';

export const metadata: Metadata = {
  title: 'Quản lý Skills | Tutor Admin Dashboard',
  description: 'Quản lý skill graph và learning content',
};

export default function SkillsPage() {
  return <SkillList />;
}
