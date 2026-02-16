import { Title, Grid, Card, Text, Center } from '@mantine/core';
import { IconUsers, IconBuilding } from '@tabler/icons-react';

export default function Dashboard() {
    // Mock Stats - In real app fetch from API
    const stats = [
        { title: 'Total de Alunos', value: '500', icon: IconUsers, color: 'blue' },
        { title: 'Total de Turmas', value: '15', icon: IconBuilding, color: 'teal' },
    ];

    return (
        <>
            <Title order={2} mb="lg">Bem-vindo ao SGE</Title>

            <Grid>
                {stats.map((stat) => (
                    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }} key={stat.title}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Card.Section withBorder inheritPadding py="xs">
                                <Text fw={500}>{stat.title}</Text>
                            </Card.Section>

                            <Center h={100}>
                                <stat.icon size={40} color={stat.color} />
                                <Text size="xl" fw={700} ml="md">{stat.value}</Text>
                            </Center>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </>
    );
}
