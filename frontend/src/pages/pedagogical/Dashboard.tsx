import { Grid, Paper, Text, Group, RingProgress, Center, Table, Title, ThemeIcon } from '@mantine/core';
import { IconSchool, IconUsers, IconChalkboard, IconUser } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

interface DashboardStats {
    counts: {
        escolas: number;
        alunos: number;
        professores: number;
        turmas: number;
    };
    at_risk: {
        aluno: string;
        motivo: string;
    }[];
}

export default function Dashboard() {
    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => (await api.get<DashboardStats>('/reports/dashboard/stats')).data
    });

    const StatsCard = ({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) => (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
                <div>
                    <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                        {title}
                    </Text>
                    <Text fw={700} fz="xl">
                        {value}
                    </Text>
                </div>
                <ThemeIcon color={color} variant="light" size={38} radius="md">
                    {icon}
                </ThemeIcon>
            </Group>
        </Paper>
    );

    return (
        <div>
            <Title order={2} mb="lg">Painel de Controle Pedagógico</Title>

            <Grid mb="lg">
                <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
                    <StatsCard title="Escolas" value={stats?.counts.escolas || 0} icon={<IconSchool size="1.4rem" />} color="blue" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
                    <StatsCard title="Alunos" value={stats?.counts.alunos || 0} icon={<IconUser size="1.4rem" />} color="teal" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
                    <StatsCard title="Professores" value={stats?.counts.professores || 0} icon={<IconUsers size="1.4rem" />} color="violet" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
                    <StatsCard title="Turmas" value={stats?.counts.turmas || 0} icon={<IconChalkboard size="1.4rem" />} color="orange" />
                </Grid.Col>
            </Grid>

            <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper withBorder p="md" radius="md">
                        <Title order={4} mb="md">Alunos em Atenção (Baixo Desempenho)</Title>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Aluno</Table.Th>
                                    <Table.Th>Motivo</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {stats?.at_risk.length ? (
                                    stats.at_risk.map((item, index) => (
                                        <Table.Tr key={index}>
                                            <Table.Td>{item.aluno}</Table.Td>
                                            <Table.Td>
                                                <Text c="red" size="sm">{item.motivo}</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={2}>
                                            <Text c="dimmed" ta="center">Nenhum aluno em risco identificado.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder p="md" radius="md" h="100%">
                        <Title order={4} mb="md">Taxa de Frequência Geral</Title>
                        <Center h={200}>
                            <RingProgress
                                size={180}
                                thickness={16}
                                roundCaps
                                sections={[{ value: 85, color: 'teal' }]} // Mocked value
                                label={
                                    <Center>
                                        <Text c="teal" fw={700} ta="center" size="xl">
                                            85%
                                        </Text>
                                    </Center>
                                }
                            />
                        </Center>
                        <Text c="dimmed" size="xs" ta="center" mt="md">
                            Média de presença nos últimos 30 dias (Simulado)
                        </Text>
                    </Paper>
                </Grid.Col>
            </Grid>
        </div>
    );
}
