import React from 'react'
//import Navbar from './Navbar'
import Fetch from './Fetch'
import BrowseCategory from './BrowsCatagory'
import BestSelling from './BestSelling'
import Explore from './Explore'
import Feature from './Feature'
import Body from './Body'

const Main: React.FC = () => {
  return (
    <div>
     

      <Body />
      <Fetch />
      <BrowseCategory />
      <BestSelling />
      <Explore />
      <Feature />

    </div>
  )
}

export default Main
