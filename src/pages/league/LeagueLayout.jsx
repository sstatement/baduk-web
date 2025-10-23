import React from 'react';
import { Outlet } from 'react-router-dom';
import { SeasonProvider } from '../../contexts/SeasonContext';
import SeasonSelect from '../../components/SeasonSelect'; // 아래 2)에서 만듦

export default function LeagueLayout() {
  return (
    <SeasonProvider>
      <div style={{maxWidth: 960, margin: '16px auto'}}>
        <SeasonSelect />
      </div>
      <Outlet />
    </SeasonProvider>
  );
}
