import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSchool, IconUsers, IconNotebook, IconPencil, IconCalendar, IconMapPin, IconLayoutDashboard } from '@tabler/icons-react';
import { useLocation } from 'wouter';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const [location, setLocation] = useLocation();

    if (location === '/portal/login') {
        return <>{children}</>;
    }

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Text fw={700} size="xl">SGE - Guiricema</Text>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <NavLink
                    label="Dashboard"
                    leftSection={<IconSchool size={20} />}
                    active={location === '/'}
                    onClick={() => setLocation('/')}
                />
                <NavLink
                    label="Alunos"
                    leftSection={<IconUsers size={20} />}
                    active={location === '/alunos'}
                    onClick={() => setLocation('/alunos')}
                />
                <NavLink
                    label="Diário de Classe"
                    leftSection={<IconNotebook size={20} />}
                    active={location === '/diario'}
                    onClick={() => setLocation('/diario')}
                />
                <NavLink
                    label="Lançamento de Notas"
                    leftSection={<IconPencil size={20} />}
                    active={location === '/notas'}
                    onClick={() => setLocation('/notas')}
                />
                <NavLink
                    label="Planejamento"
                    leftSection={<IconCalendar size={20} />}
                    active={location === '/planejamento'}
                    onClick={() => setLocation('/planejamento')}
                />

                <Text size="xs" fw={500} c="dimmed" mt="md" mb="xs">SECRETARIA</Text>

                <NavLink
                    label="Escolas"
                    leftSection={<IconSchool size={20} />}
                    active={location === '/secretaria/escolas'}
                    onClick={() => setLocation('/secretaria/escolas')}
                />
                <NavLink
                    label="Anos Letivos"
                    leftSection={<IconNotebook size={20} />}
                    active={location === '/secretaria/anos-letivos'}
                    onClick={() => setLocation('/secretaria/anos-letivos')}
                />
                <NavLink
                    label="Disciplinas"
                    leftSection={<IconNotebook size={20} />}
                    active={location === '/secretaria/disciplinas'}
                    onClick={() => setLocation('/secretaria/disciplinas')}
                />
                <NavLink
                    label="Zoneamento"
                    leftSection={<IconMapPin size={20} />}
                    active={location === '/secretaria/zoneamento'}
                    onClick={() => setLocation('/secretaria/zoneamento')}
                />
                <NavLink
                    label="Fila de Espera"
                    leftSection={<IconUsers size={20} />}
                    active={location === '/secretaria/fila'}
                    onClick={() => setLocation('/secretaria/fila')}
                />
                <NavLink
                    label="Conselho de Classe"
                    leftSection={<IconNotebook size={20} />}
                    active={location === '/secretaria/conselho'}
                    onClick={() => setLocation('/secretaria/conselho')}
                />
                <NavLink
                    label="Educacenso"
                    leftSection={<IconSchool size={20} />}
                    active={location === '/secretaria/educacenso'}
                    onClick={() => setLocation('/secretaria/educacenso')}
                />

                <Text size="xs" fw={500} c="dimmed" mt="md" mb="xs" style={{ paddingLeft: 12 }}>
                    PEDAGÓGICO
                </Text>

                <NavLink
                    label="Dashboard"
                    leftSection={<IconLayoutDashboard size={20} />}
                    active={location === '/pedagogico/dashboard'}
                    onClick={() => setLocation('/pedagogico/dashboard')}
                />
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
