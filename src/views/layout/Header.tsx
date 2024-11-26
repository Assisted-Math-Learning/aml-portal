import React from 'react';
import ENV_CONFIG from '../../constant/env.config';
import ProfileWithMenu from '../../shared-resources/components/ProfileWithMenu/ProfileWithMenu';
import { AuthContext } from '../../context/AuthContext';

type Props = {
  learnerId?: string;
  username?: string;
};

const Header: React.FC<Props> = ({ learnerId, username }) => (
  <div className='py-1 px-4 border-b-[1px] border-black flex justify-between'>
    <div className='flex gap-4 items-center'>
      <img
        src='/assets/logo.svg'
        alt='logo'
        className='h-[64px] w-[64px] rounded-full'
      />
      <p className='font-publicSans text-2xl'>
        AML v{ENV_CONFIG.APP_VERSION ?? '1.0.0'}
      </p>
    </div>

    {learnerId && (
      <AuthContext.Consumer>
        {({ onLogout }) => (
          <ProfileWithMenu onLogout={onLogout} username={username} />
        )}
      </AuthContext.Consumer>
    )}
  </div>
);

export default Header;
