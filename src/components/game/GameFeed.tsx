'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { useGameStore } from '@/store/gameStore';
import { useProfileStore } from '@/store/profileStore';

export function GameFeed() {
  const [currentPage, setCurrentPage] = useState(1);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const router = useRouter();
  const perPage = 12;

  const { games, isLoading } = useProfileStore();
  const { filterGames } = useGameStore();
  const filteredGames = filterGames(games);

  const formatDetailedCountdown = (deadline: Date) => {
    const now = new Date().getTime();
    const timeLeft = deadline.getTime() - now;
    
    if (timeLeft <= 0) return 'Closed';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, string> = {};
      filteredGames.forEach((game) => {
        const deadline = new Date(parseInt(game.deadline));
        newCountdowns[game.id] = formatDetailedCountdown(deadline);
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [filteredGames]);

  const paginatedGames = filteredGames.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filteredGames.length / perPage);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4">
        {paginatedGames.map((game) => (
          <Card 
            key={game.id}
            className="bg-[#F9F6E6]/80 relative hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
            onClick={() => router.push(`${window.location.pathname}/${game.id}`)}
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Above or Below
                <p className="text-2xl">${Number(game.isAbove).toFixed(2)}</p>
              </CardTitle>
              <CardDescription>
                Bet if {game.feed} will be below or above ${Number(game.isAbove).toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={parseFloat(game.bullCirculatingSupply)} className="h-2 bg-[#BAD8B6]" />
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Bulls: {game.bullCirculatingSupply}%</span>
                  <span className="text-red-600">Bears: {game.bearCirculatingSupply}%</span>
                </div>

                {game.isInitialized ? (
                  <div className="flex justify-between">
                    <Button className="w-full bg-green-500 hover:bg-green-600 mr-2">
                      BULLS {Number(game.baseAmountBull).toFixed(6)}
                    </Button>
                    <Button className="w-full bg-red-500 hover:bg-red-600">
                      BEARS {Number(game.baseAmountBear).toFixed(6)}
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-[#BAD8B6] hover:bg-[#9DC88E]">
                    Initialize Game
                  </Button>
                )}

                <div className="flex items-center justify-between mt-4 text-sm">
                  <Timer className="h-4 w-4" />
                  <span>{countdowns[game.id] || 'Loading...'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center w-full mt-12 mb-20">
        <Pagination />
      </div>
    </>
  );
}