import Image from 'next/image';
import { UserMenu } from './user-menu';

export function HeaderBar() {

  return <header style={{height: '5rem', width: '100vw', display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px inset #aaa', background: '#ccc', color: '#333', padding: '0.5rem 2.4rem 0.5rem 1rem'}}>
    {/* Left Section */}
    <div style={{flex: '0 0 auto', display: 'flex', flexDirection:"row", gap:'0.4rem', alignItems: 'center'}}>
      <Image src="/assets/jerry.png" alt="" width={40} height={40} />
      <h1 style={{fontWeight: 'bold'}}>Jerry</h1>
    </div>
    <div className='flex-spacer' />
    {/* Center Section */}
    <div className='flex-spacer' />
    {/* Right Section */}
    <div style={{flex: '0 0 auto'}}>
      <UserMenu />
    </div>

  </header>
}