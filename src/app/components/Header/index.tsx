import { useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { generatePath } from 'react-router-dom'
import { Layout, Button, Row, Modal } from 'antd'
import { IoMoonOutline, IoSunny } from "react-icons/io5";
import { useStore } from '../../hooks/useStore.js'
import { GravixStore } from '../../stores/GravixStore.js'
// import logoPng from "./logo.png"

const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '0px 20px',
}

export const Header = observer(() => {
    const gravixStore = useStore(GravixStore)

    const headerStyle: React.CSSProperties = {
        width: '100%',
        padding: '0px 20px',
    }

    return (
        <Layout.Header style={headerStyle}>
            <Row style={{ height: '100%' }} justify="space-between" align="middle">
                <div style={{ cursor: 'pointer' }} onClick={() => generatePath('/')}>
                    Logo
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {gravixStore.isDarkMode ? (
                        <Button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: '20px',
                            }}
                            onClick={() => gravixStore.toggleTheme()}
                            type="primary"
                            shape="circle"
                            icon={<IoMoonOutline />}
                        />
                    ) : (
                        <Button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: '20px',
                            }}
                            onClick={() => gravixStore.toggleTheme()}
                            type="primary"
                            shape="circle"
                            icon={<IoSunny />}
                        />
                    )}
                </div>
            </Row>
        </Layout.Header>
    )
})
