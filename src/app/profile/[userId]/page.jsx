import ProfilePage from '../../components/ProfilePage';

export default function UserProfilePage() {
  return <ProfilePage />;
}

export async function generateMetadata({ params }) {
  return {
    title: `User Profile`,
    description: 'View user profile',
  };
}